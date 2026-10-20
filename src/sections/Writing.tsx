import { profile } from "@/content";
import { useMediumPosts } from "@/lib/useMediumPosts";
import { Section } from "./Section";

export function Writing() {
  const { posts, status } = useMediumPosts(profile.medium);
  const mediumUrl = `https://medium.com/@${profile.medium}`;

  return (
    <Section id="writing" number="07" label="Writing">
      {status === "loading" && <p className="meta">Loading posts…</p>}
      {(status === "empty" || status === "error") && (
        <p className="text-muted">
          {status === "empty" ? "No posts yet." : "Couldn't load posts."}{" "}
          <a href={mediumUrl} target="_blank" rel="noopener noreferrer" className="text-ink link-underline">
            Read on Medium ↗
          </a>
        </p>
      )}
      {status === "ok" && (
        <>
          <ol>
            {posts.map((post) => (
              <li key={post.link} className="border-t border-rule last:border-b">
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid grid-cols-[4.5rem_1fr_auto] items-baseline gap-4 py-4 md:grid-cols-[7rem_1fr_auto]"
                >
                  <span className="meta">{post.date}</span>
                  <span className="font-serif text-xl leading-snug transition-colors group-hover:text-accent md:text-2xl">
                    {post.title}
                  </span>
                  <span className="meta whitespace-nowrap">{post.minutes} min →</span>
                </a>
              </li>
            ))}
          </ol>
          <a href={mediumUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block text-sm link-underline">
            All posts on Medium ↗
          </a>
        </>
      )}
    </Section>
  );
}
