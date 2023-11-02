<script>
    import Main from "../tetris/main.svelte"
</script>



<div class="content">
    <Main/>
</div>

<style>

    .content {
        height: 100vh;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }


    @media (max-width: 600px) {
        .content {
            height: 100svh;
        }
    }
</style>