package dns

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type CFClient struct {
	Token  string
	Zone   string
	Domain string
}

func NewFromEnv() *CFClient {
	return &CFClient{
		Token:  os.Getenv("CF_API_TOKEN"),
		Zone:   os.Getenv("CF_ZONE_ID"),
		Domain: os.Getenv("CF_DOMAIN"), // e.g. example.com
	}
}

func (c *CFClient) CreateRecord(name string, ip string) (string, error) {
	if c.Token == "" {
		return "", nil
	}
	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/zones/%s/dns_records", c.Zone)
	body, _ := json.Marshal(map[string]any{
		"type":    "A",
		"name":    name + "." + c.Domain,
		"content": ip,
		"ttl":     60,
		"proxied": false,
	})
	req, _ := http.NewRequest("POST", url, bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer "+c.Token)
	req.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	var out struct{ Result struct{ ID string } }
	json.NewDecoder(resp.Body).Decode(&out)
	return out.Result.ID, nil
}

func (c *CFClient) DeleteRecord(id string) {
	if id == "" || c.Token == "" {
		return
	}
	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/zones/%s/dns_records/%s", c.Zone, id)
	req, _ := http.NewRequest("DELETE", url, nil)
	req.Header.Set("Authorization", "Bearer "+c.Token)
	http.DefaultClient.Do(req)
}
