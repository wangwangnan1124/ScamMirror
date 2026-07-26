"use client";

import { ChangeEvent, useRef, useState } from "react";
import { analyzeScamText, ScamAnalysis } from "./lib/scam-rules";

type InputMode = "text" | "image";

const EXAMPLES = [
  {
    id: "flight",
    label: "机票退款",
    title: "“航司客服”退款",
    text: "您好，我是航空公司退改签专员。您购买的航班因机械故障取消，可获得300元额外补偿。请立即点击链接下载云会议APP，进入会议后开启屏幕共享，我们在线指导退款，逾期补偿将失效。",
  },
  {
    id: "task",
    label: "刷单返利",
    title: "兼职做任务",
    text: "恭喜你被选中做短视频点赞员，每单佣金30%，日赚500元。先充值100元完成新手任务，本金和佣金会一起返还。名额仅限今天，请马上扫描二维码进群。",
  },
  {
    id: "friend",
    label: "熟人借款",
    title: "“朋友”换新号码",
    text: "我是小周，手机掉了刚换的新号。现在人在医院急用钱，你先帮我转3000到这个指定账户，千万别给我爸妈说，我晚点解释。",
  },
  {
    id: "delivery",
    label: "普通通知",
    title: "快递取件通知",
    text: "您的快递已到松林路菜鸟驿站，取件码 6-2-318，请于营业时间内凭取件码领取。如已取件请忽略。",
  },
];

function riskClass(level: ScamAnalysis["riskLevel"]) {
  return `risk-${level}`;
}

export default function Home() {
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [message, setMessage] = useState(EXAMPLES[0].text);
  const [activeExample, setActiveExample] = useState(EXAMPLES[0].id);
  const [analysis, setAnalysis] = useState<ScamAnalysis | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageName, setImageName] = useState("");
  const [showShareCard, setShowShareCard] = useState(false);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLElement>(null);

  function loadExample(id: string) {
    const example = EXAMPLES.find((item) => item.id === id);
    if (!example) return;
    setActiveExample(id);
    setMessage(example.text);
    setAnalysis(null);
    setError("");
    setInputMode("text");
  }

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("请选择 PNG、JPG 或 WEBP 图片。");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("图片请控制在 8 MB 以内。");
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
    setImageName(file.name);
    setError("");
    setAnalysis(null);
  }

  function runAnalysis() {
    if (message.trim().length < 8) {
      setError("请粘贴至少 8 个字的可疑信息，或选择一个演示案例。");
      return;
    }

    setError("");
    setIsScanning(true);
    setAnalysis(null);

    window.setTimeout(() => {
      setAnalysis(analyzeScamText(message));
      setIsScanning(false);
      window.setTimeout(
        () => resultRef.current?.scrollIntoView({ behavior: "smooth" }),
        60,
      );
    }, 760);
  }

  function shareText() {
    if (!analysis) return "";
    return [
      "【帮我一起看看这条信息】",
      analysis.riskLabel,
      `可能类型：${analysis.suspectedPattern}`,
      analysis.signals[0]
        ? `主要原因：${analysis.signals[0].label}`
        : "当前未发现明显高危话术，但仍需核验。",
      "",
      "我暂时没有转账、点击链接或提供验证码。",
      "请帮我一起通过官方渠道核实。",
      "",
      "— 由 ScamMirror 防诈镜生成（已隐藏原始聊天内容）",
    ].join("\n");
  }

  async function copyShareCard() {
    const text = shareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main>
      <nav className="topbar" aria-label="主导航">
        <a className="brand" href="#top" aria-label="ScamMirror 首页">
          <span className="brand-mark" aria-hidden="true">
            S
          </span>
          <span>ScamMirror</span>
          <span className="brand-cn">防诈镜</span>
        </a>
        <div className="topbar-actions">
          <span className="local-pill">
            <span className="local-dot" aria-hidden="true" />
            本地演示
          </span>
          <a href="#how-it-works">如何判断</a>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-glow" aria-hidden="true" />
        <div className="eyebrow">
          <span>AI 风险解释器</span>
          <span className="eyebrow-line" />
          <span>不替你猜，帮你停下来核验</span>
        </div>
        <h1>
          转账之前，
          <br />
          <span>照一照。</span>
        </h1>
        <p className="hero-copy">
          粘贴一段可疑信息，防诈镜会标出风险证据、拆解对方的行动意图，
          并给你一条更安全的核验路径。
        </p>
        <div className="trust-row" aria-label="产品原则">
          <span>不打开陌生链接</span>
          <span>不保存聊天内容</span>
          <span>永不承诺“绝对安全”</span>
        </div>
      </section>

      <section className="scanner-shell" aria-labelledby="scanner-title">
        <div className="scanner-card">
          <div className="scanner-heading">
            <div>
              <span className="section-index">01</span>
              <h2 id="scanner-title">把可疑内容放到镜子前</h2>
            </div>
            <span className="privacy-note">内容仅在当前页面分析</span>
          </div>

          <div className="mode-tabs" role="tablist" aria-label="输入方式">
            <button
              className={inputMode === "text" ? "active" : ""}
              onClick={() => setInputMode("text")}
              role="tab"
              aria-selected={inputMode === "text"}
            >
              粘贴文字
            </button>
            <button
              className={inputMode === "image" ? "active" : ""}
              onClick={() => setInputMode("image")}
              role="tab"
              aria-selected={inputMode === "image"}
            >
              上传截图
              <span className="beta-tag">演示</span>
            </button>
          </div>

          {inputMode === "image" && (
            <div className="image-upload-area">
              <label className={`upload-box ${imagePreview ? "has-image" : ""}`}>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImage}
                />
                {imagePreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="待分析截图预览" />
                    <span className="image-change">更换图片 · {imageName}</span>
                  </>
                ) : (
                  <>
                    <span className="upload-symbol" aria-hidden="true">
                      +
                    </span>
                    <strong>选择聊天截图</strong>
                    <span>PNG、JPG 或 WEBP，最大 8 MB</span>
                  </>
                )}
              </label>
              <p className="demo-disclosure">
                开源演示版不会上传图片。请把截图中的可疑文字粘贴到下方，后续可接入视觉模型完成 OCR。
              </p>
            </div>
          )}

          <label className="message-label" htmlFor="suspicious-message">
            {inputMode === "image" ? "截图中的可疑文字" : "可疑信息"}
            <span>{message.length}/600</span>
          </label>
          <textarea
            id="suspicious-message"
            value={message}
            maxLength={600}
            onChange={(event) => {
              setMessage(event.target.value);
              setActiveExample("");
              setAnalysis(null);
            }}
            placeholder="例如：我是客服，您的账户出现异常，请立即点击链接完成认证……"
            rows={7}
          />

          <div className="example-row">
            <span>快速试用</span>
            <div className="example-buttons">
              {EXAMPLES.map((example) => (
                <button
                  key={example.id}
                  className={activeExample === example.id ? "active" : ""}
                  onClick={() => loadExample(example.id)}
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="scan-button"
            onClick={runAnalysis}
            disabled={isScanning}
          >
            <span>{isScanning ? "正在梳理风险证据…" : "开始照一照"}</span>
            <span className="button-arrow" aria-hidden="true">
              {isScanning ? "···" : "→"}
            </span>
          </button>
        </div>

        <aside className="scanner-aside" aria-label="分析预览">
          <div className="aside-top">
            <span>本次分析会看什么</span>
            <span className="pulse" aria-hidden="true" />
          </div>
          <div className="signal-preview">
            <div>
              <span className="signal-number">A</span>
              <p>
                <strong>对方是谁</strong>
                <span>是否冒充客服、机构或熟人</span>
              </p>
            </div>
            <div>
              <span className="signal-number">B</span>
              <p>
                <strong>催你做什么</strong>
                <span>转账、下载、共享或透露信息</span>
              </p>
            </div>
            <div>
              <span className="signal-number">C</span>
              <p>
                <strong>如何独立核验</strong>
                <span>绕开对方提供的链接和号码</span>
              </p>
            </div>
          </div>
          <div className="mirror-note">
            <span className="quote-mark">“</span>
            <p>
              真正重要的不是猜中一个标签，
              <br />
              而是阻止一次仓促行动。
            </p>
          </div>
        </aside>
      </section>

      {analysis && (
        <section
          className={`result-section ${riskClass(analysis.riskLevel)}`}
          ref={resultRef}
          aria-live="polite"
        >
          <div className="result-header">
            <div className="risk-orb" aria-hidden="true">
              <span />
            </div>
            <div>
              <p className="result-kicker">分析完成 · 命中 {analysis.signals.length} 个风险信号</p>
              <h2>{analysis.riskLabel}</h2>
              <p>{analysis.summary}</p>
            </div>
            <div className="pattern-chip">
              <span>疑似模式</span>
              <strong>{analysis.suspectedPattern}</strong>
            </div>
          </div>

          <div className="result-grid">
            <article className="evidence-panel">
              <div className="panel-heading">
                <span className="section-index">02</span>
                <div>
                  <h3>这些话值得停下来</h3>
                  <p>证据来自你提供的原文，不补写对话中没有的信息。</p>
                </div>
              </div>
              {analysis.signals.length > 0 ? (
                <ol className="evidence-list">
                  {analysis.signals.map((signal, index) => (
                    <li key={signal.id}>
                      <span className="evidence-count">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <blockquote>“{signal.excerpt}”</blockquote>
                        <strong>{signal.label}</strong>
                        <p>{signal.explanation}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="no-evidence">
                  <strong>没有命中已知的高危话术</strong>
                  <p>
                    这不代表对方一定可信。只要涉及付款、验证码或个人信息，都应通过独立渠道核验。
                  </p>
                </div>
              )}
            </article>

            <aside className="action-panel">
              <div className="action-block stop-block">
                <span className="action-label">现在不要做</span>
                <ul>
                  {analysis.doNot.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="action-block verify-block">
                <span className="action-label">三步独立核验</span>
                <ol>
                  {analysis.verificationSteps.map((item, index) => (
                    <li key={item}>
                      <span>{index + 1}</span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
              <button
                className="share-button"
                onClick={() => setShowShareCard(true)}
              >
                <span>生成脱敏求助卡</span>
                <span aria-hidden="true">↗</span>
              </button>
              <p className="official-tip">
                如果你正在转账或已经泄露验证码，请立即停止操作并联系支付机构；
                紧急情况拨打 110，反诈咨询可拨打 96110。
              </p>
            </aside>
          </div>
        </section>
      )}

      <section className="principles" id="how-it-works">
        <div className="principles-intro">
          <span className="section-index">03</span>
          <h2>
            防诈不是预测比赛，
            <br />
            是一次更好的决策设计。
          </h2>
        </div>
        <div className="principle-grid">
          <article>
            <span>01</span>
            <h3>证据优先</h3>
            <p>每个判断都对应原文中的具体表达，避免只有一个无法解释的分数。</p>
          </article>
          <article>
            <span>02</span>
            <h3>行动优先</h3>
            <p>结果页首先告诉用户该停止什么，以及下一步如何安全核验。</p>
          </article>
          <article>
            <span>03</span>
            <h3>不制造虚假安全</h3>
            <p>低风险只代表暂未发现明显信号，永远不向用户承诺“绝对安全”。</p>
          </article>
        </div>
      </section>

      <footer>
        <div className="footer-brand">
          <span className="brand-mark" aria-hidden="true">
            S
          </span>
          <div>
            <strong>ScamMirror 防诈镜</strong>
            <span>转账之前，照一照。</span>
          </div>
        </div>
        <p>
          本项目用于风险提示与反诈教育，不能替代警方、银行或相关机构的正式判断。
        </p>
        <div className="footer-links">
          <a
            href="https://tjca.miit.gov.cn/zwgk/wlaqgl/art/2023/art_117628b2c6154990a31d9f886e9a1028.html"
            target="_blank"
            rel="noreferrer"
          >
            官方反诈工具
          </a>
          <a
            href="https://consumer.ftc.gov/consumer-alerts/2025/03/what-are-signs-scam"
            target="_blank"
            rel="noreferrer"
          >
            风险识别原则
          </a>
        </div>
      </footer>

      {showShareCard && analysis && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowShareCard(false);
          }}
        >
          <section
            className={`share-modal ${riskClass(analysis.riskLevel)}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-title"
          >
            <button
              className="modal-close"
              onClick={() => setShowShareCard(false)}
              aria-label="关闭"
            >
              ×
            </button>
            <p className="share-eyebrow">SCAMMIRROR · FAMILY CHECK</p>
            <h2 id="share-title">帮我一起看看这条信息</h2>
            <div className="share-risk">
              <span>{analysis.riskLabel}</span>
              <strong>{analysis.suspectedPattern}</strong>
            </div>
            <p className="share-reason">
              {analysis.signals[0]
                ? `主要原因：${analysis.signals[0].label}`
                : "当前未发现明显高危话术，但仍需通过官方渠道核验。"}
            </p>
            <div className="share-promise">
              <span aria-hidden="true">✓</span>
              <p>
                我暂时没有转账、点击链接或提供验证码。
                <br />
                请帮我一起通过官方渠道核实。
              </p>
            </div>
            <p className="share-privacy">
              原始聊天内容、姓名、号码和账户信息不会出现在这张卡片中。
            </p>
            <button className="copy-button" onClick={copyShareCard}>
              {copied ? "已复制，可以发给家人了" : "复制求助文字"}
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
