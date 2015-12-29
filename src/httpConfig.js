export default {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 9000,
    base() {
        if(this.port) {
            return `http://${this.host}:${this.port}`;
        } else {
            return `http://${this.host}`;
        }
    }
}