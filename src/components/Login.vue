<template>
    <div class="Login">
        <main>
            <h1>Welcome to xTERRAIN</h1>

            <div class="Login__consentMessage">
                <p>
                    You are accessing a U.S. Government (USG) Information System (IS) that is provided for USG-authorized
                    use only.  By using this IS (which includes any device attached to this IS), you consent to the following
                    conditions:
                </p>

                <ul>
                    <li>
                        The USG routinely intercepts, and monitors communications on this IS for purposes including,
                        but not limited to, penetration testing, COMSEC monitoring, network operations and defense,
                        personnel misconduct (PM), law enforcement (LE), and counterintelligence (CI) investigations.
                    </li>
                    <li>
                        At any time, the USG may inspect and seize data stored on this IS.
                    </li>
                    <li>
                        Communications using, or data stored on, this IS are not private, are subject to routine monitoring,
                        interception, and search, and may be disclosed or used for any USG-authorized purpose.
                    </li>
                </ul>
                <p>
                    This IS includes security measures (e.g., authentication and access controls) to protect USG interests
                    -- not for your personal benefit or privacy. Notwithstanding the above, using this IS does not constitute
                    consent to PM, LE, or CI investigative searching or monitoring of the content of privileged communications,
                    or work product, related to personal representation or services by attorneys, psychotherapists, or clergy,
                    and their assistants. Such communications and work product are private and confidential. See User Agreement
                    for details.
                </p>
            </div>

            <a class="Login__button" href="/auth/login">
                <i class="fa fa-lock"/> Accept Terms and Login with GeoAxis
            </a>
        </main>
    </div>
</template>

<script>
    export default {
        name: 'Login',
    }
</script>

<style>
    .Login {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        overflow-y: scroll;
    }

    .Login h1 {
        margin-bottom: 1em;
        font-weight: 100;
    }

    .Login main {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        max-width: 50em;
        margin: 0 auto;
        text-align: center;
    }

    .Login * + p {
        margin-top: 1em;
    }

    .Login__consentMessage {
        text-align: left;
        padding: 2em;
        line-height: 1.5em;
        border: 1px solid #222;
        background-color: #111;
    }

    .Login__button {
        display: inline-block;
        line-height: 2em;
        padding: .25em 1em;
        margin-top: 1.5em;
        background-color: #16aa3e;
        border: none;
        border-radius: 4px;
        color: #fff !important;
        font-size: 16px;
        text-decoration: none;
    }

    .Login__button .fa {
        margin-right: .2em;
        padding-right: .5em;
        border-right: 1px solid;
        line-height: 2em;
    }
</style>
