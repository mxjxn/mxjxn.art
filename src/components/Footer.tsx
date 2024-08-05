import Link from "next/link";
import ComputerText from "@/components/ComputerText";

const Footer = () => {
  return (
    <div className="mt-24 p-8 h-64 border border-transparent border-t-slate-700 flex flex-col lg:flex-row justify-start gap-8">
      <div className="socials flex flex-col gap-3">
        <div className="p-2">Onchain</div>
        <div className="p-2 bg-slate-700">
          <a href="https://opensea.com/mxjxn/created"><span className="eightbit">Opensea</span></a>
        </div>
        <div className="p-2 bg-slate-700">
          <a href="https://zora.co/mxjxn"><span className="eightbit">Zora</span></a>
        </div>
        <div className="p-2 bg-slate-700">
          <a href="https://highlight.xyz/user/@mxjxn.eth"><span className="eightbit">Highlight</span></a>
        </div>
      </div>
      <div className="socials flex flex-col gap-3">
        <div className="p-2">Socials</div>
        <div className="p-2 bg-slate-700">
          <a href="https://warpcast.com/mxjxn.eth"><span className="eightbit">Farcaster:</span> @mxjxn.eth</a>
        </div>
        <div className="p-2 bg-slate-700">
          <a href="https://instagram.com/mxjxn.art"><span className="eightbit">Instagram:</span>@mxjxn.art</a>
        </div>
        <div className="p-2 bg-slate-700">
          <a href="https://twitter.com/mxjxn"><span className="eightbit">Twitter:</span> @mxjxn</a>
        </div>
      </div>
    </div>
  );
};

export { Footer };
