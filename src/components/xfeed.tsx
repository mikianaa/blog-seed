import { useEffect } from "react";

declare global {
  interface Window {
    twttr?: any;
  }
}

const XFeed = () => {
  const X_URL = process.env.X_URL || "https://twitter.com/TwitterDev";

  useEffect(() => {
    // 再描画用の関数
    const loadTwitter = () => {
      if (window.twttr && window.twttr.widgets) {
        window.twttr.widgets.load();
      }
    };

    // 既にwindow.twttrが存在する場合（＝script読み込み済み）
    if (window.twttr) {
      loadTwitter();
    } else {
      // 存在しない場合はscriptを生成して読み込む
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.onload = loadTwitter;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="twitter-feed">
      <a
        className="twitter-timeline"
        data-width="400"
        data-height="500"
        href={X_URL}
      >
        Tweets by X
      </a>
    </div>
  );
};

export default XFeed;
