import { jsx as _jsx } from "react/jsx-runtime";
export const GlobalStyles = () => (_jsx("style", { children: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }


        
        /* Prevent FOUC and blinking */
        html {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        body {
          opacity: 1;
          visibility: visible;
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
        }
        
        body.dark {
          background: linear-gradient(135deg, #0f172a, #1e293b);
        }
        

        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 20s ease infinite;
        }
        
       
    ` }));
