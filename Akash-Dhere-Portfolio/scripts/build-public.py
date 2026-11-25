"""Generate Cloudflare Pages upload directory from private Sites source."""
import html
import json
import os
from pathlib import Path
import shutil
import sys
from urllib.parse import urlsplit

root = Path(__file__).resolve().parents[1]
origin = sys.argv[1].rstrip("/")
url = urlsplit(origin)
if url.scheme != "https" or not url.hostname or url.netloc != url.hostname or url.path or url.query or url.fragment:
    sys.exit("Supply the confirmed HTTPS production origin")
out = Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=False)
shutil.copytree(root / "source-template", out, dirs_exist_ok=True)
page = out / "index.html"
markup = page.read_text()
title = "Akash Dhere | Software Developer & Aeronautical Engineering Portfolio"
description = "Explore Akash Dhere’s PHP and CodeIgniter development work at Enerlogs Analytics, meter-monitoring project, and hands-on aircraft construction and maintenance training."
markup = markup.replace("noindex,nofollow", "index,follow").replace("Akash Dhere | CV Portfolio", title.replace("&", "&amp;")).replace("Akash Dhere’s software project workspace and aeronautical training log. Explore CV evidence and compare roles.", description)
markup = markup.replace("Private CV portfolio", "Akash Dhere · Professional portfolio").replace('id="work-title" tabindex="-1"></h1>', 'id="work-title" tabindex="-1">Full-stack development</h1>').replace('<noscript><p>Enable JavaScript to explore both CVs.</p>', '<noscript><p>Akash Dhere studied aeronautical engineering and completed practical aircraft construction and maintenance training. Read his <a href="/cv/Akash_Dhere_Aeronautical_Engineering_CV.pdf">aeronautical engineering CV</a> or <a href="/cv/Akash_Dhere_IT_Software_Development_CV.pdf">software development CV</a>.</p>')
graph = [{"@type":"WebSite","@id":origin+"/#website","url":origin+"/","name":"Akash Dhere Portfolio"},{"@type":"ProfilePage","@id":origin+"/#profile","url":origin+"/","isPartOf":{"@id":origin+"/#website"},"mainEntity":{"@id":origin+"/#akash"}},{"@type":"Person","@id":origin+"/#akash","name":"Akash Dhere","alternateName":"Akash Bhagavan Dhere","url":origin+"/","description":description,"knowsAbout":["PHP","CodeIgniter 4","JavaScript","MySQL","Aircraft maintenance"]}]
head = [f'<link rel="canonical" href="{origin}/">','<link rel="icon" href="/favicon.svg" type="image/svg+xml">']
for key,value in {"og:type":"profile","og:title":title,"og:description":description,"og:url":origin+"/","og:image":origin+"/assets/software-aura.webp","twitter:card":"summary_large_image","twitter:title":title,"twitter:description":description,"twitter:image":origin+"/assets/software-aura.webp"}.items():
    attr = "property" if key.startswith("og:") else "name"
    head.append(f'<meta {attr}="{key}" content="{html.escape(value)}">')
for env,name in [("GOOGLE_SITE_VERIFICATION","google-site-verification"),("BING_SITE_VERIFICATION","msvalidate.01")]:
    if os.getenv(env):
        head.append(f'<meta name="{name}" content="{html.escape(os.environ[env])}">')
head.append('<script type="application/ld+json">'+json.dumps({"@context":"https://schema.org","@graph":graph})+'</script>')
page.write_text(markup.replace("</head>", "\n".join(head)+"\n</head>"))
(out/"robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {origin}/sitemap.xml\n")
(out/"sitemap.xml").write_text(f'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>{origin}/</loc></url></urlset>')
(out/"404.html").write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Page unavailable | Akash Dhere</title><main><h1>Page unavailable</h1><a href="/">Return to Akash Dhere’s portfolio</a></main></html>')
(out/"favicon.svg").write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 0 106 100"><path fill="#dfad47" d="M0 86 43 9H55L45 69H31L35 49 15 86Z"/><path fill="#198cda" d="M52 22H76L96 41 75 76 57 86H28L36 73H56L67 68 79 44 72 36H50Z"/></svg>')
(out/"_headers").write_text("/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n/cv/*\n  X-Robots-Tag: noindex\n")
for previous in ["intro-alloy.mp3","intro-eclipse.mp3","intro-impact.mp3","intro-prism.mp3","intro-signature.wav"]:
    if not any(previous in x.read_text() for x in out.iterdir() if x.suffix in {".js",".css",".html"}):
        (out/"assets"/previous).unlink(missing_ok=True)
