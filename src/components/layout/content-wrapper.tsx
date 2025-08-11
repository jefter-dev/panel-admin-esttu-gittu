import { cn } from "@/lib/utils";

interface ContentWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function ContentWrapper({ children, className }: ContentWrapperProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col transition-all duration-300 ease-in-out",
        "ml-0 md:ml-[3.3rem]",
        "group-has-[#secondary-sidebar]:md:ml-[18rem]",
        className
      )}
    >
      {children}
    </div>
  );
}
