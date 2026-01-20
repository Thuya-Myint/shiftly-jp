export const GlobalStyles = () => (
  <style>{`
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
        

        
       
    `}</style>
);
