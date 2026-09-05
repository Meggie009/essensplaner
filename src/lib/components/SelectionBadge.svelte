<script>
  export let count = 0;
  export let onJump = () => {};
</script>

<div class="badge">
  <span class="count">{count}</span>
  <button class="jump" on:click={onJump} aria-label="Zur Auswahl springen" title="Zur Auswahl springen">
    ↓
  </button>
</div>

<style>
  .badge {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: #d97706;
    color: white;
    border-radius: 999px;
    padding: 0.35rem 0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    font-size: 0.85rem;
    font-weight: 600;
  }

  .count {
    min-width: 1.4rem;
    text-align: center;
    padding: 0 0.3rem;
  }

  .jump {
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    line-height: 1;
  }

  .jump:hover {
    background: rgba(255, 255, 255, 0.35);
  }
</style>
