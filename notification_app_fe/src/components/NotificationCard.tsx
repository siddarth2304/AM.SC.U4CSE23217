import { NotificationItem } from "../types";

type Props = {
  item: NotificationItem;
  onViewed: (id: string) => void;
};

export function NotificationCard({ item, onViewed }: Props) {
  return (
    <article className={`notification ${item.viewed ? "viewed" : "new"}`}>
      <div className="cardHead">
        <span className={`badge ${item.type.toLowerCase()}`}>{item.type}</span>
        <time>{new Date(item.createdAt).toLocaleString()}</time>
      </div>

      <h2>{item.title}</h2>
      <p>{item.message}</p>

      <div className="cardFoot">
        <span>{item.viewed ? "Viewed" : "New"}</span>
        {!item.viewed && <button onClick={() => onViewed(item.id)}>Mark viewed</button>}
      </div>
    </article>
  );
}
