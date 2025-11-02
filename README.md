# MP Tools Bookmarklet
```javascript
javascript:(function(){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/SuperGamer474/MP-Tools@main/script.js';s.onload=function(){if(typeof MP_Tools==='function')MP_Tools();else console.error('MP_Tools not found')};s.onerror=function(){console.error('Failed to load MP_Tools')};document.head.appendChild(s);})()
```
