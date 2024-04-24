<script>
    import SuccessIcon from '~icons/material-symbols/check-small-rounded'

    export let data

    let { timeout, delayed, submitting, error } = data
    let submitted = false

    $: if ($submitting) {
        submitted = true
    } else if (submitted) {
        setTimeout(() => submitted = false, 1000)
    }
</script>

<div class="flex items-center h-6">
    {#if $timeout}
        <span class="loading loading-dots loading-md"></span>
    {:else if $delayed}
        <span class="loading loading-spinner loading-md"></span>
    {:else if (!error && submitted && !$submitting)}
        <div class="-ml-2">
            <SuccessIcon style="font-size: 2rem; color: green" />
        </div>
    {/if}
</div>
