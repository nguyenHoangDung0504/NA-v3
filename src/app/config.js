const deviceIsMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export default {
    deviceIsMobile,
    trackPerPage: deviceIsMobile ? 28 : 40,
    log: true
}