self.onmessage = async function (event) {
    const { csvPath, localData } = event.data;

    try {
        const fetchedData = await (await fetch(csvPath)).text();

        if (fetchedData !== localData) {
            postMessage({ action: 'update', data: fetchedData });
        } else {
            postMessage({ action: 'no-update' });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        postMessage({ action: 'error', error: error.message });
    }
};