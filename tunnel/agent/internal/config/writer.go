package config

import "os"

func UpdateVoiceHost(host string) {
	data := []byte("port=24454\nvoice_host=" + host + "\nbind_address=127.0.0.1\n")
	_ = os.WriteFile("voicechat-server.properties", data, 0o644)
}
