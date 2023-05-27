# Messity Javascript library

**How to connect dapp to the Messity protocol**

```
import { Messity } from "messity";

Messity.connect({
  senderName: "Some dapp name",
  onSuccess: (userPrincipal) => {
    // Persist userPrincipal in your backend and start sending messages!
  },
  onError: (e) => {
    // Handle error
  },
});
```
