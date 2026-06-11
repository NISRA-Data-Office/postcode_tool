export async function readData (code) {

    try {
        const res = await fetch(`public/data/${code}.json`);
        const data = await res.json();

        return data;

    } catch (error) {
        console.error("Failed to load data:", error);
        return; 
    }
    
}