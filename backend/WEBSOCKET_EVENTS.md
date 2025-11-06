# WebSocket Events Documentation

This document describes all WebSocket events used in the 360° РАБОТА application.

## Installation

```bash
npm install socket.io socket.io-client
npm install --save-dev @types/socket.io
```

## Connection

### Backend Setup

The WebSocket server is initialized automatically when the backend starts:

```typescript
// server.ts
import { webSocketService } from './services/WebSocketService';
webSocketService.initialize(httpServer);
```

### Frontend Setup (React Native)

```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

// Authenticate
socket.emit('authenticate', {
  userId: currentUser.id,
  role: currentUser.role, // 'jobseeker' | 'employer'
});

// Wait for authentication confirmation
socket.on('authenticated', (data) => {
  console.log('Authenticated:', data);
});

// Join application chat
socket.emit('join:application', applicationId);

// Leave application chat
socket.emit('leave:application', applicationId);
```

## Events

### 1. Message Events

#### `message:new`

Sent when a new message is created in chat.

**Payload:**
```typescript
interface MessageNewEvent {
  messageId: string;
  applicationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  messageType: 'text' | 'video' | 'voice' | 'image';
  content?: string;
  createdAt: string;
}
```

**Frontend Listener:**
```typescript
socket.on('message:new', (data: MessageNewEvent) => {
  console.log('New message:', data);

  // Update messages list
  setMessages((prev) => [...prev, {
    id: data.messageId,
    content: data.content,
    sender: { id: data.senderId, name: data.senderName },
    createdAt: new Date(data.createdAt),
  }]);

  // Show push notification if app is in background
  if (AppState.currentState !== 'active') {
    showLocalNotification({
      title: data.senderName,
      body: data.content || 'New message',
    });
  }
});
```

#### `message:deleted`

Sent when a message is deleted.

**Payload:**
```typescript
interface MessageDeletedEvent {
  messageId: string;
  applicationId: string;
  deletedBy: string;
  deletedForAll: boolean;
}
```

**Frontend Listener:**
```typescript
socket.on('message:deleted', (data: MessageDeletedEvent) => {
  console.log('Message deleted:', data);

  // Remove message from list
  setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
});
```

### 2. Video Events

#### `video:viewed`

Sent to the video sender when someone views their video.

**Payload:**
```typescript
interface VideoViewedEvent {
  videoId: string;
  messageId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  viewedAt: string;
  viewsRemaining: number;
}
```

**Frontend Listener:**
```typescript
socket.on('video:viewed', (data: VideoViewedEvent) => {
  console.log('Video viewed:', data);

  // Show notification
  Alert.alert(
    'Video Viewed',
    `${data.userName} watched your video. ${data.viewsRemaining} views remaining.`
  );

  // Update video views count
  setVideoViews((prev) => ({
    ...prev,
    [data.messageId]: data.viewsRemaining,
  }));
});
```

#### `video:deleted`

Sent when a video is auto-deleted after reaching view limit.

**Payload:**
```typescript
interface VideoDeletedEvent {
  videoId: string;
  messageId: string;
  deletedAt: string;
}
```

**Frontend Listener:**
```typescript
socket.on('video:deleted', (data: VideoDeletedEvent) => {
  console.log('Video deleted:', data);

  // Remove video from messages or mark as deleted
  setMessages((prev) =>
    prev.map((m) =>
      m.id === data.messageId
        ? { ...m, deleted: true, content: 'Video has been deleted' }
        : m
    )
  );
});
```

### 3. Application Events

#### `application:new`

Sent to employer when a new application is received.

**Payload:**
```typescript
interface ApplicationNewEvent {
  applicationId: string;
  vacancyId: string;
  vacancyTitle: string;
  jobseekerId: string;
  createdAt: string;
}
```

**Frontend Listener:**
```typescript
socket.on('application:new', (data: ApplicationNewEvent) => {
  console.log('New application:', data);

  // Show notification
  showLocalNotification({
    title: 'New Application',
    body: `You have a new application for ${data.vacancyTitle}`,
  });

  // Update applications count
  setApplicationsCount((prev) => prev + 1);

  // Fetch updated applications list
  fetchApplications();
});
```

#### `application:status_changed`

Sent to jobseeker when application status is changed by employer.

**Payload:**
```typescript
interface ApplicationStatusChangedEvent {
  applicationId: string;
  newStatus: string;
  previousStatus: string;
  changedBy: string;
  changedAt: string;
  message?: string;
}
```

**Frontend Listener:**
```typescript
socket.on('application:status_changed', (data: ApplicationStatusChangedEvent) => {
  console.log('Application status changed:', data);

  // Show notification
  showLocalNotification({
    title: 'Application Status Updated',
    body: data.message || `Status changed to ${data.newStatus}`,
  });

  // Update application in list
  setApplications((prev) =>
    prev.map((app) =>
      app.id === data.applicationId
        ? { ...app, status: data.newStatus }
        : app
    )
  );
});
```

### 4. Typing Indicators

#### `typing:start`

Sent when a user starts typing.

**Frontend:**
```typescript
// Emit when user starts typing
const handleTypingStart = () => {
  socket.emit('typing:start', applicationId);
};

// Listen for other user typing
socket.on('typing:start', (data: { userId: string }) => {
  setIsOtherUserTyping(true);
});
```

#### `typing:stop`

Sent when a user stops typing.

**Frontend:**
```typescript
// Emit when user stops typing
const handleTypingStop = () => {
  socket.emit('typing:stop', applicationId);
};

// Listen for other user stopped typing
socket.on('typing:stop', (data: { userId: string }) => {
  setIsOtherUserTyping(false);
});
```

## Example: Complete Chat Component

```typescript
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const ChatScreen = ({ applicationId, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket'],
    });

    // Authenticate
    newSocket.emit('authenticate', {
      userId: currentUserId,
      role: 'jobseeker', // or 'employer'
    });

    // Join application chat
    newSocket.on('authenticated', () => {
      newSocket.emit('join:application', applicationId);
    });

    // Listen for new messages
    newSocket.on('message:new', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // Listen for deleted messages
    newSocket.on('message:deleted', (data) => {
      setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
    });

    // Listen for typing
    newSocket.on('typing:start', () => {
      setIsOtherUserTyping(true);
    });

    newSocket.on('typing:stop', () => {
      setIsOtherUserTyping(false);
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      newSocket.emit('leave:application', applicationId);
      newSocket.disconnect();
    };
  }, [applicationId, currentUserId]);

  const handleSendMessage = (text) => {
    // Send via REST API (WebSocket event will be sent automatically)
    api.post(`/chat/${applicationId}/messages`, {
      messageType: 'text',
      content: text,
    });
  };

  return (
    <View>
      {/* Render messages */}
      {isOtherUserTyping && <Text>Typing...</Text>}
    </View>
  );
};
```

## Testing

### Using Postman

1. Install Postman
2. Create new WebSocket request
3. URL: `ws://localhost:5000`
4. Connect
5. Send: `{ "event": "authenticate", "data": { "userId": "user_123", "role": "jobseeker" } }`
6. Send: `{ "event": "join:application", "data": "app_456" }`

### Using Browser Console

```javascript
const socket = io('http://localhost:5000');

socket.emit('authenticate', {
  userId: 'user_123',
  role: 'jobseeker'
});

socket.on('authenticated', (data) => {
  console.log('Authenticated:', data);
  socket.emit('join:application', 'app_456');
});

socket.on('message:new', (data) => {
  console.log('New message:', data);
});
```

## Environment Variables

Add to `.env`:

```env
CORS_ORIGIN=http://localhost:3000,http://localhost:19006
```

## Troubleshooting

### WebSocket not connecting

1. Check CORS configuration in `server.ts`
2. Make sure server is using `httpServer.listen()` not `app.listen()`
3. Check firewall settings

### Events not received

1. Make sure you called `authenticate` first
2. Make sure you joined the application room with `join:application`
3. Check browser/app network tab for WebSocket connection

### Multiple connections

1. Always disconnect socket in cleanup (useEffect return)
2. Don't create multiple socket instances
3. Use singleton pattern for socket connection

## Best Practices

1. **Always authenticate** before emitting/listening to events
2. **Join rooms** for application-specific events
3. **Clean up** sockets on component unmount
4. **Handle reconnection** with exponential backoff
5. **Show UI feedback** when disconnected
6. **Throttle** typing indicators (300ms debounce)
7. **Test** offline scenarios
8. **Log** events for debugging

## Performance Considerations

- Use `rooms` to limit event broadcasting
- Throttle frequent events (typing indicators)
- Clean up inactive connections
- Monitor memory usage with many connections
- Use Redis adapter for horizontal scaling (future)

## Security

- Always validate user authentication
- Check permissions before emitting events
- Sanitize event payloads
- Rate limit event emissions
- Use secure WebSocket (wss://) in production
