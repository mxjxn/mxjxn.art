"use client";

import Link from 'next/link'
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import ComputerText from "@/components/ComputerText"
import { Button } from "@headlessui/react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { shortAddress } from "@/utils/address";

const Header = () => {
  const account = useAccount();
  const address = account?.address;
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const short = address ? shortAddress(address) : "not connected";
  console.log(address);

  return (
      <ComputerText>
    <div id="header" className="flex tracking-widest h-12 flex-row w-full px-4 items-center justify-between">
        <Link href="/"><div className="p-auto  text-lg">MXJXN is Max Jackson</div></Link>
      <Popover>
        <PopoverButton className="flex flex-row justify-end gap-4 w-full p-4 py-2 outline-none">
          <div className="px-2  flex flex-row justify-start gap-2">
            {address ? (
              <>
                <div>🔗</div>
                <div>{short}</div>
              </>
            ) : (
              <>
                <div>⛓️‍💥</div>
                <div>Not Connected to wallet</div>
              </>
            )}
          </div>
          {!address && <div className="px-2 text-green-400">Connect</div>}
        </PopoverButton>
        <PopoverPanel
          anchor="bottom"
          className="flex flex-col bg-[#000000cc] p-4 border border-green-200"
        >
          {connectors.map((connector) => (
            <Button
              key={connector.uid}
              onClick={() => connect({ connector })}
              type="button"
            >
              {connector.name}
            </Button>
          ))}

          {account.status === "connected" && (
            <Button type="button" onClick={() => disconnect()}>
              Disconnect
            </Button>
          )}
        </PopoverPanel>
      </Popover>
    </div>
      </ComputerText>
  );
};
export { Header };
