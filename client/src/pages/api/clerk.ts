import type { WebhookEvent } from "@clerk/clerk-sdk-node" 

import type { NextApiRequest } from 'next'

export default function handler(req: NextApiRequest) {
  const evt = req.body.evt as WebhookEvent; 

  console.log("CLERK EVENT");
  console.log("CLERK EVENT RECEIVED");

  switch (evt.type) {
    case 'user.created':
      evt.data.first_name
  }
}