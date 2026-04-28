package dns

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
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
		Domain: os.Getenv("CF_DOMAIN"),
	}
}

func (c *CFClient) CreateRecord(name string, ip string) (string, error) {
	if c.Token == "" {
		return "", nil
	}

	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/zones/%s/dns_records", c.Zone)
	body, err := json.Marshal(map[string]any{
		"type":    "A",
		"name":    name + "." + c.Domain,
		"content": ip,
		"ttl":     60,
		"proxied": false,
	})
	if err != nil {
		return "", fmt.Errorf("marshal CF request: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return "", fmt.Errorf("build CF request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+c.Token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("call CF: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= http.StatusBadRequest {
		return "", fmt.Errorf("CF create record %s: %s", resp.Status, strings.TrimSpace(string(respBody)))
	}

	var out struct {
		Success bool `json:"success"`
		Result  struct {
			ID string `json:"id"`
		} `json:"result"`
	}

	if err := json.Unmarshal(respBody, &out); err != nil {
		return "", fmt.Errorf("decode CF response: %w", err)
	}

	if !out.Success || out.Result.ID == "" {
		return "", fmt.Errorf("CF create record unsuccessful: %s", strings.TrimSpace(string(respBody)))
	}

	return out.Result.ID, nil
}

func (c *CFClient) DeleteRecord(id string) {
	if id == "" || c.Token == "" {
		return
	}

	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/zones/%s/dns_records/%s", c.Zone, id)
	req, err := http.NewRequest(http.MethodDelete, url, nil)
	if err != nil {
		return
	}
	req.Header.Set("Authorization", "Bearer "+c.Token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return
	}
	resp.Body.Close()
}
