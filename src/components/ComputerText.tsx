import React from "react";

export default function ComputerText({ children }: React.PropsWithChildren) {
  return (
    <div className="animate-text bg-gradient-to-r from-green-500 via-teal-300 to-green-500 bg-clip-text text-transparent font-black">
      {children}
    </div>
  )
}
