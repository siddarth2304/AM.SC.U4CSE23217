# Stage 1

## REST API Design

Base URL: `/api`

Headers:

```json
{
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": "Bearer <token>"
}
```

Naming conventions:
- Use plural resources such as `/notifications`.
- Use camelCase in JSON.
- Use query parameters for filters and pagination.
- Return a consistent response envelope.

Success response:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "responseTimeMs": 12
  }
}
```

Error response:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid notification type"
  }
}
```

### Get Notifications

Method: `GET`

URL: `/api/notifications?page=1&limit=10`

Purpose: Fetch paginated notifications, newest first.

Request body: none

Response body:

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Placement Drive",
      "message": "Company visit starts at 10 AM",
      "type": "Placement",
      "createdAt": "2026-05-06T08:30:00.000Z",
      "viewed": false
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "responseTimeMs": 9
  }
}
```

Status codes: `200`, `400`, `401`, `500`

### Get Notification By ID

Method: `GET`

URL: `/api/notifications/:id`

Purpose: Fetch one notification.

Request body: none

Response body:

```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Placement Drive",
    "message": "Company visit starts at 10 AM",
    "type": "Placement",
    "createdAt": "2026-05-06T08:30:00.000Z",
    "viewed": false
  }
}
```

Status codes: `200`, `401`, `404`, `500`

### Get Priority Notifications

Method: `GET`

URL: `/api/notifications/priority?n=10`

Purpose: Fetch top notifications by priority. Priority is `Placement > Result > Event`, then newest first.

Request body: none

Response body:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "limit": 10,
    "total": 0,
    "responseTimeMs": 8
  }
}
```

Status codes: `200`, `400`, `401`, `500`

### Filter Notifications

Method: `GET`

URL: `/api/notifications?type=Placement&page=1&limit=10`

Purpose: Fetch notifications by `Placement`, `Result`, or `Event`.

Request body: none

Response body:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "type": "Placement",
    "page": 1,
    "limit": 10,
    "total": 0,
    "responseTimeMs": 7
  }
}
```

Status codes: `200`, `400`, `401`, `500`

### Mark Viewed

Method: `PATCH`

URL: `/api/notifications/:id/viewed`

Purpose: Mark a notification as viewed for the current user.

Request body:

```json
{
  "viewed": true
}
```

Response body:

```json
{
  "success": true,
  "data": {
    "id": "1",
    "viewed": true
  },
  "meta": {
    "responseTimeMs": 4
  }
}
```

Status codes: `200`, `400`, `401`, `404`, `500`

### Create Notification

Method: `POST`

URL: `/api/notifications`

Purpose: Create a notification.

Request body:

```json
{
  "title": "Exam Result",
  "message": "Semester results are published",
  "type": "Result"
}
```

Response body:

```json
{
  "success": true,
  "data": {
    "id": "2",
    "title": "Exam Result",
    "message": "Semester results are published",
    "type": "Result",
    "createdAt": "2026-05-06T09:00:00.000Z",
    "viewed": false
  }
}
```

Status codes: `201`, `400`, `401`, `403`, `500`

### Update Notification

Method: `PUT`

URL: `/api/notifications/:id`

Purpose: Update notification content.

Request body:

```json
{
  "title": "Updated Placement Drive",
  "message": "Venue changed to auditorium",
  "type": "Placement"
}
```

Response body:

```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Updated Placement Drive",
    "message": "Venue changed to auditorium",
    "type": "Placement",
    "createdAt": "2026-05-06T08:30:00.000Z",
    "viewed": false
  }
}
```

Status codes: `200`, `400`, `401`, `403`, `404`, `500`

### Delete Notification

Method: `DELETE`

URL: `/api/notifications/:id`

Purpose: Delete a notification.

Request body: none

Response body:

```json
{
  "success": true,
  "data": {
    "id": "1",
    "deleted": true
  }
}
```

Status codes: `200`, `401`, `403`, `404`, `500`

## Real-Time Notifications

Server-Sent Events are a good fit because campus notifications are usually pushed from server to browser. The browser opens `GET /api/notifications/stream`, and the server keeps the connection open. When a new notification is created, the server sends an event with the notification JSON. SSE is simpler than WebSocket for one-way updates and reconnects automatically. WebSocket is better later if admins need live two-way workflows.

# Stage 2

PostgreSQL is suitable because notifications are structured, need reliable writes, support joins, and require filters by user, type, read status, and time. PostgreSQL gives transactions, constraints, indexes, and good query planning.

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT UNIQUE,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) UNIQUE NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(30) NOT NULL CHECK (notification_type IN ('Event', 'Result', 'Placement')),
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notification_reads (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_id BIGINT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, notification_id)
);
```

Scaling issues include large feed scans, expensive unread counts, deep offset pagination, and heavy fan-out for campus-wide messages. SQL can handle this with composite indexes, cursor pagination, table partitioning, and cached counters. NoSQL can help for precomputed per-student feeds, but consistency and reporting become harder. A balanced approach keeps PostgreSQL as source of truth and uses Redis for read-heavy projections.

# Stage 3

Slow query:

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

The query is probably not correct for a normalized design. `studentID` and `isRead` are per-user delivery state, not global notification state. Read status belongs in `notification_reads` or a delivery table.

It becomes slow with 50,000 students and 5,000,000 notifications because the database may scan many rows, filter by one student and unread state, then sort by `createdAt`. Without a composite index matching the filter and sort, the cost is high.

Indexing every column is bad because indexes use disk, slow writes, increase maintenance, and may not help real query patterns.

Useful indexes:

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications (student_id, is_read, created_at);

CREATE INDEX idx_notification_reads_user_notification
ON notification_reads (user_id, notification_id);

CREATE INDEX idx_notifications_type_created
ON notifications (notification_type, created_at DESC);
```

Optimized unread query:

```sql
SELECT n.*
FROM notifications n
LEFT JOIN notification_reads nr
  ON nr.notification_id = n.id
 AND nr.user_id = 1042
WHERE nr.id IS NULL
ORDER BY n.created_at ASC
LIMIT 50;
```

Without indexes the likely cost is near `O(N log N)` because many rows may be scanned and sorted. With a matching index, it is closer to `O(log N + K)`.

Placement notifications in the last 7 days:

```sql
SELECT n.*
FROM notifications n
WHERE n.notification_type = 'Placement'
  AND n.created_at >= now() - interval '7 days'
ORDER BY n.created_at DESC;
```

# Stage 4

Redis caching can store hot data such as priority notifications, unread counts, and the first feed page. Pagination reduces payload size and database work. Lazy loading improves first render by loading more only when needed.

Polling is simple but wastes API calls when nothing changes. SSE or WebSocket reduces repeated requests and gives near real-time updates. SSE is simpler for one-way notification pushes. WebSocket is better for two-way communication.

API optimization should avoid `SELECT *`, use response metadata, apply compression, use indexes, and avoid expensive joins on every page load. Tradeoffs include stale cache data, extra cache invalidation logic, queue complexity, and connection management for real-time channels.

# Stage 5

Bad pseudocode:

```python
for student_id in student_ids:
    send_email(student_id, message)
    save_to_db(student_id, message)
    push_to_app(student_id, message)
```

It is slow because every student is processed sequentially. One slow email call blocks DB saves and app pushes for every remaining student. Partial failures happen when some students are processed before an error. The log may say email failed halfway while some students already received email and others were skipped.

The DB transaction should save the notification and delivery rows. Email sending should happen outside the transaction through a queue because external calls cannot be rolled back.

```python
with transaction:
    notification_id = save_notification(message)
    for batch in chunks(student_ids, 500):
        save_delivery_rows(notification_id, batch, status="pending")
        enqueue_after_commit("send_notification_batch", notification_id, batch)

worker send_notification_batch(notification_id, student_ids):
    for student_id in student_ids:
        delivery = get_delivery(notification_id, student_id)
        if delivery.status == "sent":
            continue

        try:
            send_email(student_id, notification_id)
            push_to_app(student_id, notification_id)
            mark_delivery_sent(notification_id, student_id)
        except temporary_error:
            retry_later(notification_id, student_id)
        except permanent_error as error:
            mark_delivery_failed(notification_id, student_id, error.message)
```

# Stage 6

Top `n` priority notifications use `Placement > Result > Event`, then `createdAt DESC`. For small practice data, in-memory sorting is fine. At scale, SQL can order by a computed rank and limit the result:

```sql
ORDER BY
  CASE notification_type
    WHEN 'Placement' THEN 1
    WHEN 'Result' THEN 2
    WHEN 'Event' THEN 3
  END,
  created_at DESC
LIMIT 10;
```

A rolling top list can be maintained in Redis. A heap or priority queue keeps only the best `n` items from a stream, reducing work from sorting everything to `O(N log n)`.

# Stage 7

The frontend should have a small architecture: API functions, reusable components, one notifications page with All and Priority views, local state for filter/page/loading/error, and vanilla CSS. Viewed state is updated with `PATCH /api/notifications/:id/viewed`, then reflected locally. The UI should be responsive, simple, and clear on desktop and mobile.
