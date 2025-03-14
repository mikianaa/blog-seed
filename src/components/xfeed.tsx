import { useEffect } from "react";

const XFeed = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.setAttribute("src", "https://platform.twitter.com/widgets.js");
    script.setAttribute("async", "true");
    document.body.appendChild(script);
  }, []);
  return (
    <div className="twitter-feed">
      <a
        className="twitter-timeline"
        data-width="400"
        data-height="500"
        href="https://twitter.com/PXIf8kVZCLOlrrD?ref_src=twsrc%5Etfw"
      >
        Tweets by Mikirin!!!
        {/* <script
        async
        src="https://platform.twitter.com/widgets.js"
        charSet="utf-8"
      ></script> */}
      </a>
    </div>
  )
};

export default XFeed;
