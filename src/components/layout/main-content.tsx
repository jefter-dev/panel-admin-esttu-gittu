export function MainContent({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <main
      className="flex-grow overflow-y-auto bg-background"
      data-cy="main-content-area"
    >
      {children}
    </main>
  );
}
