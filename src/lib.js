function sleep(delayInMilliseconds) {
    return new Promise(resolve => setTimeout(resolve, delayInMilliseconds));
}

module.exports = {
    sleep,
}
