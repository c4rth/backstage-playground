## org-charts

Test project for Charts/Diagrams + Backstage using Mermaid

## Getting started

Start write your documentation by adding more markdown (.md) files to this folder (/docs) or replace the content in this file.

## Table of Contents

The Table of Contents on the right is generated automatically based on the hierarchy
of headings. Only use one H1 (`#` in Markdown) per file.

## Site navigation

For new pages to appear in the left hand navigation you need edit the `mkdocs.yml`
file in root of your repo. The navigation can also link out to other sites.

Alternatively, if there is no `nav` section in `mkdocs.yml`, a navigation section
will be created for you. However, you will not be able to use alternate titles for
pages, or include links to other sites.

Note that MkDocs uses `mkdocs.yml`, not `mkdocs.yaml`, although both appear to work.
See also <https://www.mkdocs.org/user-guide/configuration/>.

## Support

That's it. If you need support, reach out in [#docs-like-code](https://discord.com/channels/687207715902193673/714754240933003266) on Discord.


```mermaid
sequenceDiagram
GitLab->>Kroki: Request rendering
Kroki->>Mermaid: Request rendering
Mermaid-->>Kroki: Image
Kroki-->>GitLab: Image
```


```mermaid
flowchart  TD
    START((fa:fa-question))
    START -->|Request| RFCM{"`RFC
     Meeting`"}
    RFCM --->|Accepted| US["User Story"]
    RFCM --->|Rejected| START

    subgraph analysis [Analysis]
        direction LR

        IM{"`Implementation
     Meeting`"}

        US --> IM
        IM -->|"`Tasks, Definition-of-Done and Estimation`"| SPP
    end

    SPP{"`Sprint
     Planning`"}
    SPP ---->|"Sprint start"| IMPL

    subgraph implementation ["Implementation"]
        direction LR

        IMPL{Development}
        FF["Fix/Feature"]
        UTEST["Unit Test"]
        DOC["Documentation"]
        ATEST["Acceptance Test"]
        PR["Pull Request"]
        REV{"`Review
        Quality & DoD
        `"}

        IMPL --> FF
        FF --> UTEST
        UTEST --> DOC
        DOC --> ATEST
        ATEST --> PR
        PR --> REV
        REV -->|Approved| MERGE{"Merge"}
        REV -->|Rejected| IMPL
    end

    subgraph deployment ["Deployment"]
        direction LR

        MERGE -->|"`Continuous
        Integration`"| CI
        CI -->|"`Continuous
        Deployment`"| CD
        CD -->|"`Continuous
        Monitoring`"| CM

    end

```

<!-- prettier-ignore -->
!!! bug
Bug: Mermaidjs no longer works in Backstage if the mermaid template has a title set?!


```mermaid
---
title: Change or feature request
---

flowchart  TD
    START((fa:fa-question))
    START -->|Request| RFCM{"`RFC
     Meeting`"}
    RFCM --->|Accepted| US["User Story"]
    RFCM --->|Rejected| START

    subgraph analysis [Analysis]
        direction LR

        IM{"`Implementation
     Meeting`"}

        US --> IM
        IM -->|"`Tasks, Definition-of-Done and Estimation`"| SPP
    end

    SPP{"`Sprint
     Planning`"}
    SPP ---->|"Sprint start"| IMPL

    subgraph implementation ["Implementation"]
        direction LR

        IMPL{Development}
        FF["Fix/Feature"]
        UTEST["Unit Test"]
        DOC["Documentation"]
        ATEST["Acceptance Test"]
        PR["Pull Request"]
        REV{"`Review
        Quality & DoD
        `"}

        IMPL --> FF
        FF --> UTEST
        UTEST --> DOC
        DOC --> ATEST
        ATEST --> PR
        PR --> REV
        REV -->|Approved| MERGE{"Merge"}
        REV -->|Rejected| IMPL
    end

    subgraph deployment ["Deployment"]
        direction LR

        MERGE -->|"`Continuous
        Integration`"| CI
        CI -->|"`Continuous
        Deployment`"| CD
        CD -->|"`Continuous
        Monitoring`"| CM

    end
```