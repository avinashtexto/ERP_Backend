import { scheduleHelloMessage } from '../src/queue/hello.producer.js';

// Schedule "Hello Hello Avinash" for 10 seconds from now
const scheduledTime = new Date();
scheduledTime.setSeconds(scheduledTime.getSeconds() + 10);

console.log(`Scheduling "Hello Hello Avinash" for: ${scheduledTime.toLocaleString()}`);

await scheduleHelloMessage('Hello Hello Avinash', scheduledTime);

console.log('Scheduled successfully!');
process.exit(0);
