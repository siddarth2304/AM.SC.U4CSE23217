import { useEffect, useMemo, useState } from "react";
import { Log } from "logging_middleware";
import { getNotifications, getPriorityNotifications, markNotificationViewed } from "../api/notifications";
import { NotificationCard } from "../components/NotificationCard";
import { StatusMessage } from "../components/StatusMessage";
import { FilterType, NotificationItem } from "../types";

const filters: FilterType[] = ["All", "Placement", "Result", "Event"];
const pageSize = 5;

export function NotificationsPage() {
  const [view, setView] = useState<"all" | "priority">("all");
  const [filter, setFilter] = useState<FilterType>("All");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [responseTimeMs, setResponseTimeMs] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const response =
          view === "priority"
            ? await getPriorityNotifications(10)
            : await getNotifications(filter, page, pageSize);

        if (!active) {
          return;
        }

        setItems(response.data);
        setTotal(view === "priority" ? response.data.length : response.meta.total || 0);
        setResponseTimeMs(response.meta.responseTimeMs);
        await Log("frontend", "info", "page", `Loaded ${view} notifications`);
      } catch (err) {
        if (!active) {
          return;
        }

        const message = err instanceof Error ? err.message : "Unable to load notifications";
        setError(message);
        setItems([]);
        setTotal(0);
        setResponseTimeMs(undefined);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [view, filter, page]);

  function changeView(nextView: "all" | "priority") {
    setView(nextView);
    setPage(1);
  }

  function changeFilter(nextFilter: FilterType) {
    setFilter(nextFilter);
    setPage(1);
  }

  async function handleViewed(id: string) {
    try {
      const response = await markNotificationViewed(id);
      setItems((current) => current.map((item) => (item.id === id ? response.data : item)));
      await Log("frontend", "info", "component", `Marked notification ${id} viewed`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to mark viewed";
      setError(message);
    }
  }

  return (
    <main className="page">
      <section className="topbar">
        <div>
          <h1>Campus Notifications</h1>
          <p>Official notices for placements, results, and campus events.</p>
        </div>

        <div className="tabs" aria-label="Notification views">
          <button className={view === "all" ? "active" : ""} onClick={() => changeView("all")}>
            All Notifications
          </button>
          <button
            className={view === "priority" ? "active" : ""}
            onClick={() => changeView("priority")}
          >
            Priority
          </button>
        </div>
      </section>

      <section className="toolbar">
        <div className="filters" aria-label="Notification type filters">
          {filters.map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              disabled={view === "priority"}
              onClick={() => changeFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="meta">
          <span>{total} total</span>
          {responseTimeMs !== undefined && <span>{responseTimeMs} ms</span>}
        </div>
      </section>

      {loading && <StatusMessage text="Loading notifications..." />}
      {!loading && error && <StatusMessage text={error} tone="error" />}
      {!loading && !error && items.length === 0 && <StatusMessage text="No notifications found." />}

      {!loading && !error && items.length > 0 && (
        <section className="list" aria-label="Notifications">
          {items.map((item) => (
            <NotificationCard key={item.id} item={item} onViewed={handleViewed} />
          ))}
        </section>
      )}

      {view === "all" && !loading && !error && items.length > 0 && (
        <section className="pagination" aria-label="Pagination">
          <button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {pageCount}
          </span>
          <button disabled={page === pageCount} onClick={() => setPage((value) => value + 1)}>
            Next
          </button>
        </section>
      )}
    </main>
  );
}
