import DiscussSidebar from "../components/DiscussSidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="">
      <DiscussSidebar />
      <main className="w-full">{children}</main>
    </div>
  );
}
