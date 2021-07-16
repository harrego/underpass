# underpass

Basic web page to control Philips Hue devices. Originally created to allow me to control Hue devices from my BlackBerry. It uses basic HTML, no JavaScript, and completely server-sided logic, if ran locally over HTTP (more on this below) it can be used on any internet enabled device that has had it's wings clipped by SSL.

![Preview Image](https://raw.githubusercontent.com/harrego/underpass/main/.github/preview.png)

## Usage

1. Grab all dependencies with `npm i`.
2. Set your port and password with environment variables `PORT` and `PASSWORD`.
3. Push the button on your Hue bridge and run `node index.js`, it will automatically configure, save the credentials to `credentials.csv` (for future runs) and start the server.
4. Go to `localhost:3000/password` (change port and password to configured values)

### Docker

There is optionally a `Dockerfile`, follow the usage instructions from step 2 onwards.

## HTTP Security Risks Notice

Running web apps on your local network without SSL is still a security risk. Anyone on your network can sniff the traffic to the server, steal the configured password and then control your lights. Be careful.
