export async function readData (code) {

    try {

        let data_cached = localStorage.getItem(code);

        const parsed_data = data_cached ? JSON.parse(data_cached): null;
        let {ts, data} = parsed_data ? parsed_data : [null, null];

        if (Date.now() - ts > 60 * 60 * 1000) {
            localStorage.removeItem(code);
            data_cached = null;
        }

        if (!data_cached) {

            const res = await fetch(`public/data/${code}.json`);
            data = await res.json();
            
            localStorage.setItem(code, JSON.stringify({ ts: Date.now(), data }))
            
        }

        return data;

    } catch (error) {
        console.error("Failed to load data:", error);
        return; 
    }
    
}