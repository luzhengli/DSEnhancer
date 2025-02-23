// Initialize mermaid with configuration
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose'
});

class MermaidRenderer {
  constructor() {
    this.processedBlocks = new Set();
    this.observer = null;
    this.setupObserver();
    this.initialRender();
  }

  setupObserver() {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // Check for newly added nodes
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Process the node itself and any mermaid blocks within it
              this.findAndRenderMermaidBlocks(node);
            }
          });
        }
      }
    });

    // Start observing the chat container with expanded configuration
    const config = {
      childList: true,
      subtree: true
    };
    this.observer.observe(document.body, config);
  }

  initialRender() {
    this.findAndRenderMermaidBlocks(document.body);
  }

  async findAndRenderMermaidBlocks(container) {
    // If the container itself is a code block, process it directly
    if (container.classList?.contains('md-code-block')) {
      await this.processSingleBlock(container);
      return;
    }

    // Otherwise, look for code blocks within the container
    const codeBlocks = container.querySelectorAll('.md-code-block');
    for (const block of codeBlocks) {
      await this.processSingleBlock(block);
    }
  }

  async processSingleBlock(block) {
    if (this.processedBlocks.has(block)) return;

    const infoString = block.querySelector('.md-code-block-infostring');
    if (!infoString || infoString.textContent.toLowerCase().trim() !== 'mermaid') return;

    const pre = block.querySelector('pre');
    if (!pre) return;

    try {
      const mermaidCode = pre.textContent.trim();
      const { svg } = await mermaid.render(`mermaid-${Date.now()}`, mermaidCode);

      // Create container for the rendered diagram
      const diagramContainer = document.createElement('div');
      diagramContainer.className = 'mermaid-diagram';
      diagramContainer.innerHTML = svg;

      // Insert the diagram after the code block
      block.parentNode.insertBefore(diagramContainer, block.nextSibling);

      this.processedBlocks.add(block);
    } catch (error) {
      console.error('Failed to render Mermaid diagram:', error);

      const errorContainer = document.createElement('div');
      errorContainer.className = 'mermaid-error';
      errorContainer.textContent = `Error rendering diagram: ${error.message}`;
      block.parentNode.insertBefore(errorContainer, block.nextSibling);
    }
  }
}

// Initialize the renderer when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new MermaidRenderer();
  });
} else {
  new MermaidRenderer();
}

// Function to render mermaid diagram
async function renderMermaidDiagram(codeBlock) {
  const { codeBlockType, pre } = getMermaidCodeBlock(codeBlock);

  try {
    if (codeBlockType === 'mermaid') {
      const mermaidCode = pre.textContent;
      // Initialize mermaid
      mermaid.initialize({ startOnLoad: true });

      // Render the diagram
      const { svg } = await mermaid.render(`mermaid-${Date.now()}`, mermaidCode);

      // Create a container for the diagram
      const diagramContainer = document.createElement('div');
      diagramContainer.className = 'mermaid-diagram';
      diagramContainer.innerHTML = svg;

      return diagramContainer;
    }
    return null;
  } catch (error) {
    console.error('Failed to render Mermaid diagram:', error);
    return null;
  }
}

// Helper function to get mermaid code block elements
function getMermaidCodeBlock(codeBlock) {
  const codeBlockType = codeBlock.querySelector('.md-code-block-infostring').textContent;
  const pre = codeBlock.querySelector("pre");

  return {
    codeBlockType,
    pre
  };
}

// Add click event listener to mermaid code blocks
document.addEventListener('DOMContentLoaded', () => {
  const codeBlocks = document.querySelectorAll('.md-code-block');

  codeBlocks.forEach(codeBlock => {
    // codeBlock.addEventListener('click', async () => {
    const diagram = renderMermaidDiagram(codeBlock);
    if (diagram) {
      // Insert diagram as a sibling element below the code block
      codeBlock.insertAdjacentElement('afterend', diagram); // 这里意思是把diagram插入到codeBlock的后面
    }
    // });
  });
}); 