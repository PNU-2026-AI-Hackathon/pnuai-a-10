type PersonalInfoKind =
  | "RRN"
  | "CARD"
  | "EMAIL"
  | "PHONE"
  | "ACCOUNT"
  | "ADDRESS"
  | "NAME";

type TokenState = {
  counters: Record<PersonalInfoKind, number>;
  tokenToOriginal: Map<string, string>;
  originalToToken: Map<string, string>;
  namespace: string;
  reservedTokens: Set<string>;
};

export type PersonalInfoTokenMap = Record<string, string>;

export type PersonalInfoMaskingResult = {
  text: string;
  tokenMap: PersonalInfoTokenMap;
};

const LABEL_BY_KIND: Record<PersonalInfoKind, string> = {
  RRN: "[주민등록번호]",
  CARD: "[카드번호]",
  EMAIL: "[이메일]",
  PHONE: "[전화번호]",
  ACCOUNT: "[계좌번호]",
  ADDRESS: "[주소]",
  NAME: "[이름]",
};

const TOKEN_PREFIX_BY_KIND: Record<PersonalInfoKind, string> = {
  RRN: "RRN",
  CARD: "CARD",
  EMAIL: "EMAIL",
  PHONE: "PHONE",
  ACCOUNT: "ACCOUNT",
  ADDRESS: "ADDRESS",
  NAME: "NAME",
};

const INTERNAL_TOKEN_PATTERN =
  /\[\[LEAKCARE_[A-Z0-9]+_[A-Z]+_\d+\]\]/g;

function createTokenNamespace(): string {
  return `${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 10)}`.toUpperCase();
}

function createTokenState(): TokenState {
  return {
    counters: {
      RRN: 0,
      CARD: 0,
      EMAIL: 0,
      PHONE: 0,
      ACCOUNT: 0,
      ADDRESS: 0,
      NAME: 0,
    },
    tokenToOriginal: new Map<string, string>(),
    originalToToken: new Map<string, string>(),
    namespace: createTokenNamespace(),
    reservedTokens: new Set<string>(),
  };
}

function rememberExistingInternalTokens(
  input: string,
  tokenState?: TokenState
) {
  if (!tokenState) {
    return;
  }

  for (const match of input.matchAll(INTERNAL_TOKEN_PATTERN)) {
    tokenState.reservedTokens.add(match[0]);
  }
}

function getReplacement(
  original: string,
  kind: PersonalInfoKind,
  tokenState?: TokenState
): string {
  if (!tokenState) {
    return LABEL_BY_KIND[kind];
  }

  const mapKey = `${kind}:${original}`;
  const existingToken =
    tokenState.originalToToken.get(mapKey);

  if (existingToken) {
    return existingToken;
  }

  let token = "";

  do {
    tokenState.counters[kind] += 1;
    token = `[[LEAKCARE_${tokenState.namespace}_${TOKEN_PREFIX_BY_KIND[kind]}_${tokenState.counters[kind]}]]`;
  } while (
    tokenState.reservedTokens.has(token) ||
    tokenState.tokenToOriginal.has(token)
  );

  tokenState.reservedTokens.add(token);
  tokenState.originalToToken.set(mapKey, token);
  tokenState.tokenToOriginal.set(token, original);

  return token;
}

function replaceFullMatch(
  text: string,
  pattern: RegExp,
  kind: PersonalInfoKind,
  tokenState?: TokenState
): string {
  return text.replace(pattern, (match) =>
    getReplacement(match, kind, tokenState)
  );
}

function replaceCapturedValue(
  text: string,
  pattern: RegExp,
  kind: PersonalInfoKind,
  tokenState?: TokenState
): string {
  return text.replace(
    pattern,
    (match, prefix: string, value: string) =>
      match.replace(
        value,
        getReplacement(value, kind, tokenState)
      )
  );
}

function isDateLikeNumberCandidate(value: string): boolean {
  return /^\d{4}[-./]\d{1,2}[-./]\d{1,2}$/.test(
    value.trim()
  );
}

function replaceAccountValue(
  text: string,
  tokenState?: TokenState
): string {
  return text.replace(
    /((?:계좌번호|입금\s*계좌|출금\s*계좌|환불\s*계좌|계좌)\s*(?:번호|은|는|이|가|:|：)?[^0-9\n]{0,30})(\d{2,6}(?:[-\s]\d{2,6}){2,5}|\d{10,14})\b/g,
    (match, prefix: string, value: string) => {
      if (isDateLikeNumberCandidate(value)) {
        return match;
      }

      return `${prefix}${getReplacement(
        value,
        "ACCOUNT",
        tokenState
      )}`;
    }
  );
}

function maskText(
  input: string,
  tokenState?: TokenState
): string {
  rememberExistingInternalTokens(input, tokenState);

  let masked = input;

  masked = replaceFullMatch(
    masked,
    /\b\d{6}-[1-4]\d{6}\b/g,
    "RRN",
    tokenState
  );

  masked = replaceCapturedValue(
    masked,
    /((?:주민등록번호|주민번호|주민등록)\s*(?:은|는|이|가|:|：)?\s*)(\d{13})\b/g,
    "RRN",
    tokenState
  );

  masked = replaceFullMatch(
    masked,
    /\b\d{4}[-\s]\d{4}[-\s]\d{4}[-\s]\d{4}\b/g,
    "CARD",
    tokenState
  );

  masked = replaceCapturedValue(
    masked,
    /((?:카드번호|신용카드번호|체크카드번호)\s*(?:은|는|이|가|:|：)?\s*)(\d{13,19})\b/g,
    "CARD",
    tokenState
  );

  masked = replaceFullMatch(
    masked,
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    "EMAIL",
    tokenState
  );

  masked = replaceFullMatch(
    masked,
    /\b(?:01[016789]|02|0[3-6][1-5])[-.\s]?\d{3,4}[-.\s]?\d{4}\b/g,
    "PHONE",
    tokenState
  );

  masked = replaceAccountValue(masked, tokenState);

  masked = replaceCapturedValue(
    masked,
    /((?:주소|거주지|배송지|자택주소|사업장주소)\s*(?:은|는|이|가|:|：)?\s*)([^\n.。!?]*?(?:특별시|광역시|특별자치시|특별자치도|도|시|군|구|읍|면|동)\s+[^\n.。!?]*?(?:로|길|번길|번지)\s*\d+(?:[-\s]\d+)?)(?=(?:입니다|이에요|예요|이고|이며|,|\.|\n|$))/g,
    "ADDRESS",
    tokenState
  );

  masked = replaceFullMatch(
    masked,
    /\b(?:서울특별시|부산광역시|대구광역시|인천광역시|광주광역시|대전광역시|울산광역시|세종특별자치시|제주특별자치도|경기도|강원도|충청북도|충청남도|전라북도|전라남도|경상북도|경상남도)\s+[가-힣]+(?:시|군|구)\s+[^\n.。!?]*?(?:로|길|번길|번지)\s*\d+(?:[-\s]\d+)?/g,
    "ADDRESS",
    tokenState
  );

  masked = replaceCapturedValue(
    masked,
    /((?:이름|성명|수신인|고객명)\s*(?:은|는|이|가|:|：)?\s*)([가-힣]{2,4})(?=(?:이고|이며|입니다|이에요|예요|님|씨|\s|,|\.|\n|$))/g,
    "NAME",
    tokenState
  );

  masked = replaceFullMatch(
    masked,
    /[가-힣]{2,4}(?=의\s*(?:전화번호|휴대전화|휴대폰|연락처|이메일|메일|주소|계좌))/g,
    "NAME",
    tokenState
  );

  return masked;
}

export function maskPersonalInfo(input: string): string {
  return maskText(input);
}

export function createPersonalInfoTokenMasker() {
  const tokenState = createTokenState();

  return {
    mask(input: string): string {
      return maskText(input, tokenState);
    },

    restore(input: string): string {
      let restored = input;

      for (const [
        token,
        original,
      ] of tokenState.tokenToOriginal.entries()) {
        restored = restored.split(token).join(original);
      }

      return restored;
    },

    getTokenMap(): PersonalInfoTokenMap {
      return Object.fromEntries(
        tokenState.tokenToOriginal.entries()
      );
    },
  };
}

export function maskPersonalInfoWithTokens(
  input: string
): PersonalInfoMaskingResult {
  const masker = createPersonalInfoTokenMasker();
  const text = masker.mask(input);

  return {
    text,
    tokenMap: masker.getTokenMap(),
  };
}
