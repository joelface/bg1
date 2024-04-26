import Screen from '../Screen';

export default function News() {
  return (
    <Screen title="BG1 News">
      <iframe
        src="https://joelface.github.io/bg1/news.html"
        className="absolute inset-0 w-full h-full"
      />
    </Screen>
  );
}
