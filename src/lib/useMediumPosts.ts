import { useEffect, useState } from "react";

export type Post = {
  title: string;
  link: string;
  date: string;
  minutes: number;
};

type Status = "loading" | "ok" | "empty" | "error";

type FeedItem = { title: string; link: string; pubDate: string; content?: string; description?: string };

export function useMediumPosts(user: string, limit = 6) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const url = `https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@${user}`;
    let cancelled = false;

    fetch(url)
      .then((res) => res.json())
      .then((data: { status: string; items?: FeedItem[] }) => {
        if (cancelled) return;
        if (data.status !== "ok" || !data.items?.length) {
          setStatus("empty");
          return;
        }
        setPosts(
          data.items.slice(0, limit).map((item) => {
            const text = new DOMParser().parseFromString(item.content ?? item.description ?? "", "text/html")
              .body.textContent ?? "";
            return {
              title: item.title,
              link: item.link,
              date: new Date(item.pubDate.replace(" ", "T")).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              }),
              minutes: Math.max(1, Math.round(text.split(/\s+/).length / 220)),
            };
          }),
        );
        setStatus("ok");
      })
      .catch(() => !cancelled && setStatus("error"));

    return () => {
      cancelled = true;
    };
  }, [user, limit]);

  return { posts, status };
}
