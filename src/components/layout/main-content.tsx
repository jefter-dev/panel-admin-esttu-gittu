export function MainContent({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <main
      className="flex-grow overflow-y-auto bg-background w-[100vw] md:w-auto"
      data-cy="main-content-area"
    >
      {children}
    </main>
  );
}
