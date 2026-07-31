export default function ThemeInitScript() {
  const code = `
    (function () {
      try {
        var stored = localStorage.getItem("theme");
        var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        var isDark = stored ? stored === "dark" : prefersDark;
        document.documentElement.classList.toggle("dark", isDark);
      } catch (e) {}
    })();
  `;
  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
