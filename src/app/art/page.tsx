import type { NextPage } from "next";

const Art: NextPage = () => {
  return (
    <>
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">Max's Art</h1>
      </div>
    </>
  );
};

export const dynamic = "force-static"

export default Art;

