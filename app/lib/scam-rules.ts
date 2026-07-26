export type RiskLevel = "high" | "verify" | "low";

export type RiskSignal = {
  id: string;
  label: string;
  explanation: string;
  excerpt: string;
  weight: number;
};

export type ScamAnalysis = {
  riskLevel: RiskLevel;
  riskLabel: string;
  summary: string;
  suspectedPattern: string;
  signals: RiskSignal[];
  doNot: string[];
  verificationSteps: string[];
  score: number;
};

type SignalRule = Omit<RiskSignal, "excerpt"> & {
  exclusions?: RegExp[];
  patterns: RegExp[];
};

const SIGNAL_RULES: SignalRule[] = [
  {
    id: "screen-share",
    label: "要求共享屏幕或远程控制",
    explanation:
      "共享屏幕或开启远程控制后，对方可能看到验证码、支付信息，甚至直接操作设备。",
    weight: 5,
    patterns: [
      /共享屏幕/i,
      /屏幕共享/i,
      /远程控制/i,
      /远程协助/i,
      /控制.{0,4}(手机|电脑)/i,
    ],
  },
  {
    id: "verification-code",
    label: "索要验证码或敏感信息",
    explanation:
      "验证码、银行卡密码和身份证照片不应通过聊天发给陌生人。",
    weight: 5,
    patterns: [
      /验证码/i,
      /支付密码/i,
      /银行卡密码/i,
      /身份证.{0,3}(照片|正反面)/i,
      /卡号.{0,4}(发|提供|告诉)/i,
    ],
    exclusions: [
      /无需.{0,8}(提供|填写|发送)?.{0,3}验证码/i,
      /不要.{0,8}(提供|填写|发送)?.{0,3}验证码/i,
      /不会.{0,8}(索要|要求|询问)?.{0,3}验证码/i,
    ],
  },
  {
    id: "safe-account",
    label: "要求转入所谓安全账户",
    explanation:
      "“安全账户”“监管账户”是冒充公检法和客服类骗局中的高危话术。",
    weight: 5,
    patterns: [
      /安全账户/i,
      /监管账户/i,
      /资金清查/i,
      /资金验证/i,
      /转到.{0,8}(指定|这个|以下).{0,4}(账户|卡)/i,
    ],
  },
  {
    id: "install-app",
    label: "引导安装陌生软件",
    explanation:
      "正常退款或账户核验通常不需要下载会议、投屏或远程控制软件。",
    weight: 4,
    patterns: [
      /下载.{0,10}(会议|投屏|远程|客服).{0,4}(软件|APP|app)/i,
      /安装.{0,10}(软件|APP|app|安装包)/i,
      /打开.{0,8}(会议|远程协助)/i,
      /\.apk\b/i,
    ],
  },
  {
    id: "pay-first",
    label: "要求先付款、垫资或缴费",
    explanation:
      "以退款、兼职、中奖或放款为由要求先付款，是常见的资金诱导结构。",
    weight: 4,
    patterns: [
      /先.{0,5}(转账|转款|转\d|付款|支付|垫付|充值|交费|缴费)/i,
      /(先|需要|要求).{0,8}(支付|缴纳|交).{0,8}(保证金|解冻金|认证金|手续费|税费)/i,
      /(保证金|解冻金|认证金|手续费|税费).{0,8}(转|交|付|缴)/i,
      /做任务.{0,8}(返|提现|佣金)/i,
      /垫资/i,
    ],
  },
  {
    id: "unusual-payment",
    label: "指定高风险付款方式",
    explanation:
      "礼品卡、虚拟币、私下转账等方式通常难以追踪或追回。",
    weight: 4,
    patterns: [
      /礼品卡/i,
      /购物卡/i,
      /虚拟币/i,
      /加密货币/i,
      /USDT/i,
      /比特币/i,
      /私下转账/i,
    ],
  },
  {
    id: "secrecy",
    label: "要求对家人或机构保密",
    explanation:
      "阻止你向家人、银行或警方核实，是为了切断外部判断和劝阻。",
    weight: 4,
    patterns: [
      /不要.{0,6}(告诉|联系).{0,4}(家人|银行|警察|警方)/i,
      /别.{0,6}(告诉|联系).{0,4}(家人|爸|妈|银行|警察|警方)/i,
      /保密/i,
      /不能告诉/i,
      /不要声张/i,
    ],
  },
  {
    id: "urgent",
    label: "制造紧迫感",
    explanation:
      "催促立即操作会压缩核验时间，让人更容易在焦虑中做决定。",
    weight: 2,
    patterns: [
      /立即/i,
      /马上/i,
      /最后.{0,4}(机会|期限|通知)/i,
      /仅限.{0,8}(分钟|小时|今天)/i,
      /逾期/i,
      /否则.{0,8}(冻结|停用|取消|失效|起诉)/i,
    ],
  },
  {
    id: "impersonation",
    label: "以权威或熟人身份施压",
    explanation:
      "头像、来电显示和个人信息都可能被伪造，应通过自己找到的联系方式反向核验。",
    weight: 2,
    patterns: [
      /我是.{0,10}(客服|公安|民警|法院|检察院|领导|老板|老师)/i,
      /(公安局|法院|检察院|银监会|航空公司).{0,8}(通知|客服|专员)/i,
      /你.{0,4}(涉嫌|涉案|违法)/i,
      /换了新号/i,
    ],
  },
  {
    id: "unknown-link",
    label: "把操作引向陌生链接或二维码",
    explanation:
      "应从官方 App 或自己搜索到的官网进入，不要使用对方提供的入口。",
    weight: 2,
    patterns: [
      /https?:\/\//i,
      /点击.{0,6}(链接|网址)/i,
      /扫描.{0,4}(二维码|码)/i,
      /复制.{0,6}(浏览器|打开)/i,
    ],
  },
  {
    id: "reward",
    label: "承诺异常回报或补偿",
    explanation:
      "高额返利、稳赚收益或超出常理的补偿，常被用来诱导首次付款。",
    weight: 2,
    patterns: [
      /稳赚/i,
      /保本/i,
      /高额返利/i,
      /日赚/i,
      /佣金.{0,6}\d+%/i,
      /双倍返还/i,
      /额外补偿/i,
    ],
  },
  {
    id: "account-threat",
    label: "用账户异常或法律后果制造恐惧",
    explanation:
      "账户冻结、征信受损或被起诉等威胁，应直接向相关机构官方渠道核实。",
    weight: 2,
    patterns: [
      /账户.{0,6}(异常|冻结|停用)/i,
      /影响征信/i,
      /征信.{0,4}(受损|异常)/i,
      /逮捕令/i,
      /拘捕/i,
      /起诉/i,
    ],
  },
];

function splitIntoSentences(text: string) {
  return text
    .split(/[\n。！？!?；;]/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function findExcerpt(text: string, patterns: RegExp[]) {
  const sentences = splitIntoSentences(text);

  for (const sentence of sentences) {
    if (patterns.some((pattern) => pattern.test(sentence))) {
      return sentence.length > 54 ? `${sentence.slice(0, 54)}…` : sentence;
    }
  }

  return "在输入内容中发现相关风险话术";
}

function inferPattern(text: string, signalIds: Set<string>) {
  if (/机票|航班|退票|改签|航空/i.test(text)) return "机票退改签类风险";
  if (/刷单|做任务|点赞|佣金|返利/i.test(text)) return "刷单返利类风险";
  if (/公安|法院|检察院|涉案|逮捕/i.test(text)) return "冒充公检法类风险";
  if (/领导|老板|老师|亲戚|朋友|换了新号/i.test(text))
    return "冒充熟人类风险";
  if (/投资|股票|基金|虚拟币|USDT|带单/i.test(text))
    return "虚假投资类风险";
  if (/贷款|放款|额度|征信/i.test(text)) return "贷款征信类风险";
  if (/快递|包裹|理赔|客服|退款/i.test(text)) return "冒充客服类风险";
  if (signalIds.has("verification-code")) return "账户盗用类风险";
  return "复合型社交工程风险";
}

export function analyzeScamText(rawText: string): ScamAnalysis {
  const text = rawText.trim();
  const signals = SIGNAL_RULES.flatMap((rule) => {
    const excluded = rule.exclusions?.some((pattern) => pattern.test(text));
    const matched =
      !excluded && rule.patterns.some((pattern) => pattern.test(text));
    if (!matched) return [];

    return [
      {
        id: rule.id,
        label: rule.label,
        explanation: rule.explanation,
        weight: rule.weight,
        excerpt: findExcerpt(text, rule.patterns),
      },
    ];
  }).sort((a, b) => b.weight - a.weight);

  const score = signals.reduce((total, signal) => total + signal.weight, 0);
  const signalIds = new Set(signals.map((signal) => signal.id));
  const criticalSignalIds = new Set([
    "screen-share",
    "verification-code",
    "safe-account",
  ]);
  const detectedIds = new Set(signals.map((signal) => signal.id));
  const hasCriticalSignal = signals.some((signal) =>
    criticalSignalIds.has(signal.id),
  );
  const hasHighRiskCombination =
    (detectedIds.has("pay-first") &&
      ["reward", "urgent", "account-threat"].some((id) =>
        detectedIds.has(id),
      )) ||
    (detectedIds.has("unusual-payment") &&
      ["impersonation", "urgent", "reward"].some((id) =>
        detectedIds.has(id),
      )) ||
    (detectedIds.has("secrecy") && detectedIds.has("impersonation"));
  const riskLevel: RiskLevel =
    hasCriticalSignal || hasHighRiskCombination || score >= 7
      ? "high"
      : score >= 2
        ? "verify"
        : "low";

  const doNot = new Set<string>();
  const verificationSteps = new Set<string>();

  if (signalIds.has("screen-share") || signalIds.has("install-app")) {
    doNot.add("不要安装陌生软件，也不要开启屏幕共享或远程控制");
  }
  if (signalIds.has("verification-code")) {
    doNot.add("不要提供验证码、支付密码、银行卡或身份证照片");
  }
  if (
    signalIds.has("safe-account") ||
    signalIds.has("pay-first") ||
    signalIds.has("unusual-payment")
  ) {
    doNot.add("暂停一切转账、充值、垫付和所谓资金验证");
  }
  if (signalIds.has("unknown-link")) {
    doNot.add("不要点击对方发送的链接或扫描二维码");
  }
  if (doNot.size === 0) {
    doNot.add("在完成独立核验前，不要提供个人信息或进行付款");
  }

  verificationSteps.add("退出当前对话，让自己至少停一分钟");
  if (/机票|航班|退票|改签|航空/i.test(text)) {
    verificationSteps.add("从购票平台订单页或航空公司官方 App 查找客服电话");
  } else if (/快递|包裹|理赔/i.test(text)) {
    verificationSteps.add("从购物订单或快递公司官方 App 查询物流与理赔状态");
  } else if (/公安|法院|检察院|涉案/i.test(text)) {
    verificationSteps.add("不要按对方指示转接，直接通过 110 或当地警方核实");
  } else if (/银行|账户|征信|贷款|信用卡/i.test(text)) {
    verificationSteps.add("拨打银行卡背面的官方客服电话独立核实");
  } else {
    verificationSteps.add("使用自己找到的官方号码联系相关机构，不使用对方提供的入口");
  }
  verificationSteps.add("把脱敏后的信息发给一位可信家人或朋友共同判断");

  const suspectedPattern =
    riskLevel === "low" ? "暂未识别出典型模式" : inferPattern(text, signalIds);

  const riskCopy = {
    high: {
      label: "高风险，先停止操作",
      summary:
        "这段信息同时出现了多个典型风险信号。先不要争辩或继续操作，改用独立渠道核验。",
    },
    verify: {
      label: "需要核验，先别着急",
      summary:
        "发现了值得警惕的表达，但仅凭当前内容还不能判断真伪。请暂停并独立核验。",
    },
    low: {
      label: "暂未发现明显风险",
      summary:
        "当前文字未命中明显高危话术，但这不等于安全。涉及付款或个人信息时仍需核验。",
    },
  }[riskLevel];

  return {
    riskLevel,
    riskLabel: riskCopy.label,
    summary: riskCopy.summary,
    suspectedPattern,
    signals: signals.slice(0, 6),
    doNot: Array.from(doNot),
    verificationSteps: Array.from(verificationSteps),
    score,
  };
}
