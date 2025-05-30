export default function Authlayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="h-screen w-screen flex bg-[#1B1B1B]">
      <div className="bg-[url(/images/bg-image.svg)] bg-center bg-no-repeat bg-cover h-screen w-screen fixed opacity-20 z-0" />
      <div className="flex-1 z-20 text-white">{children}</div>
    </main>
  );
}
