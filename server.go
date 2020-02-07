package main

import (
    "os"
    "net/http"
    "strings"
    "path/filepath"
)

func distHandler(w http.ResponseWriter, r *http.Request) {
    url := "./" + filepath.Clean(r.URL.Path[1:])
    ae := r.Header.Get("Accept-Encoding")

    if strings.Contains(ae, "br") {
        h := w.Header()
        h.Set("Content-Encoding", "br")
        h.Set("Content-Type", "application/javascript")
        url = url + ".br"
    } else if strings.Contains(ae, "gzip") {
        h := w.Header()
        h.Set("Content-Encoding", "gzip")
        h.Set("Content-Type", "application/javascript")
        url = url + ".gz"
    }

    http.ServeFile(w, r, url)
}

func publicHandler(w http.ResponseWriter, r *http.Request) {
    url := "./public/" + filepath.Clean(r.URL.Path[1:])

    if _, err := os.Stat(url); os.IsNotExist(err) {
        http.ServeFile(w, r, "./public/index.html")
        return
    }

    http.ServeFile(w, r, url)
}

func main() {
    cert := os.Args[1]
    priv := os.Args[2]

    http.HandleFunc("/", publicHandler)
    http.HandleFunc("/dist/", distHandler)
    http.ListenAndServeTLS(":5001", cert, priv, nil)
}
