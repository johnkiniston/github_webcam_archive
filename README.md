# github_webcam_archive
 Archive the feed from a webcam using github workflows
 Initial code based on https://github.com/adamstirtan/webcam_feed

 To configure create a Action with the following main.yml

```
name: Scrape
  on:
    workflow_dispatch:
jobs:
  scrape:
    name: "Scrape latest photo"
    runs-on: ubuntu-latest
    steps:
      - name: "(setup) checkout"
        uses: actions/checkout@v3
        
      - name: "(setup) deno"
        uses: maximousblk/setup-deno@v2.0.0
      
      - name: deno run
        env:
          DATEFORMAT: yyyy-MM-dd-HH-mm-ss
          DIR: archive
          LINKNAME: latest.jpg
          URL: https://camera.simplybits.net/177n.jpg
          
        run: deno run --unstable --allow-env --allow-net --allow-read --allow-write main.ts

      - name: commit + push
        if: ${{ success() }}
        uses: stefanzweifel/git-auto-commit-action@v4.16.0
        with:
                commit_message: Automated Change
                branch: photos
                push_options: --force
                create_branch: true
```
