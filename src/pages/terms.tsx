import type { NextPage } from 'next'
import Head from 'next/head'
import { Typography } from '@mui/material'
import Link from 'next/link'
import MUILink from '@mui/material/Link'
import { IS_OFFICIAL_HOST } from '@/config/constants'

const SafeTerms = () => (
  <div>
    <Typography variant="h1" mb={2}>
      Terms and Service
    </Typography>
    <p>Last updated: January 2024.</p>
    <p>
      These Terms of Service (the &ldquo;Agreement&rdquo;) are a legal agreement between you (&ldquo;you&rdquo;,
      &ldquo;yours&rdquo; or &ldquo;User&rdquo;) and Klaytn Foundation Limited (&ldquo;Klaytn&rdquo;, &ldquo;we&rdquo;,
      &ldquo;our&rdquo; or &ldquo;us&rdquo;). We are a company registered in Singapore. You can contact us by writing to
      &nbsp;
      <Link href="mailto:contact@klaytn.foundation" passHref legacyBehavior>
        <MUILink target="_blank" rel="noreferrer">
          contact@klaytn.foundation
        </MUILink>
      </Link>
      .
    </p>
    <h3>1. What is the Klaytn Safe?</h3>
    Klaytn Safe is a multi-sig wallet for the Klaytn ecosystem. It is a fork of the well-known multi-sig wallet Safe
    (prev. Gnosis Safe).
    <br />
    The following are the benefits of Klaytn Safe.
    <ol start={1}>
      <li>
        <b>Store and Transfer KLAY, KCTs (KIP7, KIP13):</b> Users can deposit your virtual assets such as KLAY and
        Klaytn Compatible Tokens (KCTs, fungible or non-fungible) to a KSafe address and also transfer to a destination
        address.
      </li>
      <li>
        <b>Security:</b> Assets in your KSafe wallet are highly secured, because the confirmation threshold gives users
        the liberty to decide which transaction should be executed, so you don&apos;t have to worry about one owner
        running off with the asset.
      </li>
      <li>
        <b>Safe Apps:</b> KSafe&apos;s functionality is expanded by the addition of custom apps that enable batch
        transactions and interaction with other dApps. One example of this safe app is the Transaction Builder. With a
        transaction builder, you don&apos;t have to worry about executing sets of transactions one after another. This
        batch transactions feature allows for transactions to be combined and executed at a click.
      </li>
    </ol>
    <h3>2. Terms</h3>
    <ol start={1}>
      <li>
        &ldquo;KSafe&rdquo; or &ldquo;Services&rdquo; refers to the Klaytn Safe services, the Klay Safe, provided by
        Klaytn, whether through{' '}
        <Link href="https://klaytn.foundation/">
          <MUILink target="_blank" rel="noreferrer">
            Klaytn Foundation
          </MUILink>
        </Link>{' '}
        website any associated website, API, or mobile application related, linked or otherwise connected thereto. You
        may use the Services by accessing the{' '}
        <Link href="https://safe.klaytn.foundation">
          <MUILink target="_blank" rel="noreferrer">
            KSafe
          </MUILink>
        </Link>{' '}
        website and connecting your blockchain wallet such as Kaikas. For the avoidance of doubts, all content and
        functionality on the Services is the exclusive property of Klaytn or its licensors and is protected by
        applicable laws. Klaytn hereby grants you a limited, non-exclusive, non-transferable, revocable license pursuant
        to Section 8 herein to use the Services solely for your own benefit, provided that you comply with this
        Agreement. Nothing on this Services should be construed as granting directly or indirectly or by implication any
        license or right to use any Klaytn intellectual property other than as expressly set forth herein. All rights
        not expressly granted are reserved.
      </li>
      <li>
        By using any Services offered by us, you agree that you have read, understood, and accept all of the terms and
        conditions contained in this Agreement, including the &nbsp;
        <Link href="https://docs.klaytn.foundation/misc/terms-of-use">
          <MUILink target="_blank" rel="noreferrer">
            terms of use
          </MUILink>
        </Link>{' '}
        of Klaytn website and the{' '}
        <Link href="https://klaytn.foundation/privacy/">
          <MUILink target="_blank" rel="noreferrer">
            privacy policy
          </MUILink>
        </Link>{' '}
        of Klaytn website incorporated herein by reference, as amended from time to time (Agreement and terms of use and
        privacy policy of Klaytn website collectively referred to as the &ldquo;Terms of Use&rdquo; ).&nbsp;
        <b>
          IF YOU DO NOT AGREE WITH ALL OR PART OF THESE TERMS OF USE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING KSAFE
          AND MUST STOP OR DISCONTINUE USING THE SERVICES IMMEDIATELY
        </b>
        .
      </li>
      <li>
        You may easily find this Agreement on the Services screen. Each time you use KSafe you will be bound by the
        Agreement in force at that time. From time to time, we may change this Agreement. We will publish those changes
        on{' '}
        <Link href="https://safe.klaytn.foundation">
          <MUILink target="_blank" rel="noreferrer">
            KSafe
          </MUILink>
        </Link>{' '}
        website seven (7) days prior to the enforcement date of the amended terms of the Agreement and you will be bound
        by the amended Agreement at the time you use KSafe after such enforcement date. For your benefit, if any of the
        amended terms may materially affect your use of KSafe, we will make notice of such changes thirty (30) days
        prior to the enforcement date. If you do not agree to those changes, you must not use KSafe. You can always ask
        us about the Agreement in effect at the time of your access to the KSafe by writing to &nbsp;{' '}
        <Link href="mailto:partnership@klaytn.foundation">
          <MUILink target="_blank" rel="noreferrer">
            partnership@klaytn.foundation
          </MUILink>
        </Link>
        . Every time you wish to use KSafe, please check and ensure that you agree with the latest updated version of
        the Agreement. Any failure to check the Agreement or object to the Agreement by not using the Services shall be
        your responsibility.
      </li>
      <li>
        The information provided on the Services is not intended for distribution to or use by any person or entity in
        any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would
        subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who
        choose to access the Services do so on their own initiative and are solely responsible for compliance with local
        laws, if and to the extent local laws are applicable.
      </li>
    </ol>
    <h3>3. User Representations</h3>
    <ol start={1}>
      <li>
        By using the KSafe, you represent and warrant that: (1) you are 19 years of age or older, you have legal
        capacity, and you agree to comply with these Terms of Use; (2) you will not access the KSafe through automated
        or non-human means, whether through a bot, script, or otherwise; (3) you will not use KSafe for any illegal or
        unauthorized purpose; and (4) your use of KSafe will not violate any applicable law or regulation.
      </li>
      <li>
        If any of the information you provided is untrue, inaccurate, not current, or incomplete, Klaytn has the right
        to suspend or terminate your account and refuse any and all current and future use of KSafe.
      </li>
      <li>
        The obligation to manage your wallet information shall be borne by you and you shall not allow a third person to
        use such information or use the same for the purpose of lease, transfer, collateral, etc. You shall be liable
        for all disadvantages caused by a breach of this section or the third person&apos;s wilful misconduct or
        negligence.
      </li>
    </ol>
    <h3>4. What you agree to and warrant ?</h3>
    <ol start={1}>
      <li>
        By using KSafe you hereby agree, and warrant that:
        <ol style={{ listStyleType: 'lower-alpha' }}>
          <li>
            You are of 19-year-old age or older and you agree to provide documentation providing such status if
            requested or required by Klaytn.
          </li>
          <li>You have read and understood this Agreement and agree to be bound by the Terms of Use.</li>
          <li>
            Your usage of KSafe is legal under the laws of your jurisdiction or under the laws or regulation, including,
            without limitation, any applicable export control laws.
          </li>
          <li>
            You will comply with any applicable tax obligations in your jurisdiction arising from your use of KSafe.
          </li>
          <li>
            You understand the functionality, usage, storage, transmission mechanisms and intricacies associated with
            assets as well as blockchain technology and blockchain-based software systems.
          </li>
          <li>
            You understand and agree that transactions on Klaytn blockchain are irreversible and may not be erased, that
            your KSafe address and transactions are displayed permanently and publicly and that you relinquish any right
            of rectification or erasure of your data.
          </li>
          <li>
            You will not misuse or gain unauthorized access to KSafe by knowingly inserting viruses, cross-site
            scripting, Trojan horses, worms, time-bombs, keystroke loggers, spyware, adware or any other harmful
            programs or similar computer program designed to negatively affect KSafe and that in the event you do so or
            otherwise attack KSafe, we reserve the right to report any such activity to the relevant law enforcement
            authorities and we will take full measures to cooperate with those authorities as required.
          </li>
          <li>
            You will not use our KSafe to store, trade or transmit assets that are proceed of criminal or fraudulent
            activity.
          </li>
          <li>
            You will not interfere with the normal provision of the Services by Klaytn by using the Services in ways
            other than those provided by Klaytn (automatic access program, etc.).
          </li>
          <li>
            You will not use KSafe for activities for unlawful or fraudulent or have such purpose of effect or otherwise
            support any activities that breach local, national or international regulation or law.
          </li>
          <li>
            You will not tarnish the reputation or disrupt the business of Klaytn, Services and other third parties.
          </li>
          <li>
            You understand that KSafe is in early development stage, and we accordingly do not guarantee a 100%
            error-free process and give no price or liquidity guarantee.
          </li>
          <li>You are using KSafe at your own risk.</li>
        </ol>
        <li>You will make a joint effort toward smooth Service operation and a sound online community culture.</li>
        <li>
          You agree to notify us of bugs, system errors, defects, etc., found in the course of using the Services, and
          shall not disseminate the same to other user or misuse them.
        </li>
        <li>
          You shall have an obligation to faithfully respond to our inquiries into whether you use illegal programs,
          macro programs or in a manner prohibited in this Agreement.
        </li>
        <li>
          You shall be responsible for managing their accounts on PCs and mobile devices. We shall not be responsible
          for any losses caused by the management of Member&apos;s accounts, PCs, mobile devices and other various
          authentication tools or by allowing another person to use the same.
        </li>
      </li>
    </ol>
    <h3>5. What Licenses and access do we grant to you ?</h3>
    <ol start={1}>
      <li>
        We license but do not sell to you the Services you download solely for your own personal, non-commercial use. If
        you are a business user, we license but do not sell to you the Services you download to use solely for your own
        internal business use.
      </li>
      <li>
        The Services may contain code, commonly referred to as open-source software, which is distributed under
        open-source license terms, including terms which allow the free distribution and modification of the relevant
        software&apos;s source code and/or which require all distributors to make such source code freely available upon
        request, including any contributions or modifications made by such distributor (&ldquo;Open-Source
        Software&rdquo;). To the extent that the Services contain any Open-Source Software, that element only is
        licensed to you under the relevant license terms of the applicable third party licensor (&ldquo;Open-Source
        License Terms&rdquo;) and not under this Agreement, and you accept and agree to be bound by such Open-Source
        License Terms.
      </li>
    </ol>
    <h3>6. What can you expect from the Services and can we make changes to them ?</h3>
    <ol start={1}>
      <li>
        Except as set out in this Agreement, we do not warrant, represent or guarantee that the Services will be
        accurate, complete, correct, reliable integer, fit for purpose, secure or free from weaknesses, vulnerabilities
        or bugs.
      </li>
      <li>
        To the fullest extent permitted by law, we provide the Services to you &ldquo;as is&rdquo; and &ldquo;as
        available&rdquo;, &ldquo;with all faults&rdquo; basis and without any warranty, representation or assurance
        (whether express or implied) in relation to merchantability, fitness for a particular purpose, availability,
        security, title or non-infringement.
      </li>
      <li>
        We may temporarily suspend the provision of the Services in the event of maintenance, replacement and breakdown
        of information and communication facilities such as computers, communication failure or other significant
        operational reasons. In such a case, we will notify you of this fact by publishing the notice on the Services
        screen; provided, however, we may provide such notification after the fact when it has an inevitable reason for
        failing to do so.
      </li>
      <li>
        We may conduct regular inspections when necessary for the provision of the Services, and the time of such
        inspections shall be published on the Services screen. In the event of a regular inspection, there may be
        restrictions on the use of the Services, in whole or in part, and we shall not be held liable for any damage
        caused thereby unless such damage is caused by our wilful misconduct or gross negligence.
      </li>
      <li>
        We reserve the right to change the format and features of the Services by making any updates to Services
        available for you to download or, where your device settings permit it, by automatic delivery of updates.
      </li>
      <li>
        You are not obliged to download the updated Services, but we may cease to provide and/or update prior versions
        of the Services and, depending on the nature of the update, in some circumstances you may not be able to
        continue using the Services until you have downloaded the updated version. You shall be solely responsible for
        any failure to timely upload or update the Services and we shall not be held liable for any damage caused
        thereby unless such damage is caused by our wilful misconduct or gross negligence.
      </li>
      <li>
        We shall not be held liable for any problems that cause restrictions on the use of certain functions of the
        Services due to disruptions in services provided by third parties in relation to the Services or inspections,
        etc., unless such problems are caused by our wilful misconduct or gross negligence. In such a case, we will
        announce or notify you of such fact.
      </li>
      <li>
        We may cease to provide and/or update content to the Services, with or without notice to you, if it improves the
        Services we provide to you, or we need to do so for security, legal or any other reasons.
      </li>
      <li>
        We may provide various information or notifications deemed necessary in the course of your use of the Services
        through pop-up appearing on the Services screen or other reasonable means; provided, however, that you may, at
        any given time, refuse to receive information, except for transaction-related information pursuant to applicable
        law and responses to customer inquiries, etc.
      </li>
      <li>
        We may publish advertisements on the Services screen. Users who have received such advertisements may express
        their intention to refuse to receive such transmissions from us.
      </li>
      <li>
        We are not liable for any losses incurred by you as a result of your failure to update and download the updated
        version of the Services.
      </li>
    </ol>
    <h3>7. What about third-party risk and the terms of third-party platform providers and application stores ?</h3>
    <ol start={1}>
      <li>
        KSafe relies in part on third party and open-source software, including the Klaytn blockchain, and the continued
        development and support by third parties. There is no assurance or guarantee that those third parties will
        maintain their support of their own software or that open-source software will continue to be maintained. This
        may have a material adverse effect on KSafe.
      </li>
      <li>
        WE DO NOT WARRANT THAT THE DATA, SOFTWARE, FUNCTIONS, OR ANY OTHER INFORMATION OFFERED ON OR THROUGH OUR
        SERVICES WILL BE UNINTERRUPTED, UPDATED OR FREE OF ERRORS OF FACT OR OMISSIONS, VIRUSES OR OTHER HARMFUL
        COMPONENTS AND DO NOT WARRANT THAT ANY OF THE FOREGOING WILL BE CORRECTED. WE DO NOT WARRANT OR MAKE ANY
        REPRESENTATIONS REGARDING THE USE OR THE RESULTS OF THE USE OF THE SERVICES IN TERMS OF CORRECTNESS, ACCURACY,
        RELIABILITY, OR OTHERWISE.
      </li>
      <li>
        YOU UNDERSTAND AND AGREE THAT IF YOU USE, ACCESS, DOWNLOAD, OR OTHERWISE OBTAIN INFORMATION, MATERIALS, OR DATA
        THROUGH OUR SERVICES, THE SAME SHALL BE AT YOUR OWN DISCRETION AND RISK AND THAT YOU WILL BE SOLELY RESPONSIBLE
        FOR ANY DAMAGE TO YOUR PROPERTY (INCLUDING YOUR COMPUTER SYSTEM AND/OR OTHER DEVICE) OR LOSS OF DATA THAT
        RESULTS FROM THE DOWNLOAD OR USE OF SUCH MATERIAL OR DATA.
      </li>
      <li>
        KSAFE MAY INCLUDE CONTENT, MATERIAL, LINKS OR SERVICES INCLUDING WITHOUT LIMITATION THIRD PARTY WEBSITES, APPS
        OR DAPPS FROM THE THIRD-PARTY (COLLECTIVELY, &ldquo;THIRD PARTY SERVICES&rdquo;). SUCH THIRD PARTY SERVICES ARE
        PROVIDED FOR USER&apos;S CONVENIENCE AND WE SHALL NOT GUARANTEE THE SAFETY, LEGALITY OR SUSTAINABILITY OF SUCH
        THIRD PARTY SERVICES. WE ARE NOT RESPONSIBLE FOR THE MAINTENANCE AND MANAGEMENT OF THIRD PARTY SERVICES OR
        MATERIALS REFERENCED FROM THIRD PARTY SERVICES, AND PROVIDE NO GUARANTEE OF ANY KIND REGARDING THIRD PARTY
        SERVICES.
      </li>
      <li>
        WE SHALL NOT BE HELD LIABLE FOR ANY DAMAGES, LOSSES OR OTHER IMPACT, DIRECTLY OR INDIRECTLY CAUSED BY THE USE OF
        THIRD PARTY SERVICES THAT ARE NOT BELONGED TO US.
      </li>
    </ol>
    <h3>8. What about our liability to you ?</h3>
    <ol start={1}>
      <li>
        To the fullest extent permitted by applicable laws, in no event shall we be liable for any losses, including any
        loss of your asset (including without limitation, KLAY, KCTs or any other virtual assets either tangible or
        intangible) or any indirect or consequential losses, or for any loss of profit, revenue, contracts, data,
        goodwill or other similar losses.
      </li>
      <li>
        We are neither aware of purposes of your use of Services nor willing to involve in your use of the Service for a
        certain purpose, unless such use is in accordance with this Agreement or the Terms of Use or any applicable law.
        You understand and accept that you use the Services at your own risk.
      </li>
      <li>
        We are neither aware of purposes of your use of Services nor willing to involve in your use of the Service for a
        certain purpose, unless such use is in accordance with this Agreement or the Terms of Use or any applicable law.
        You understand and accept that you use the Services at your own risk.
      </li>
      <li>
        Where we are operating in conjunction with third parties and/or any other third-party systems (collectively,
        &ldquo;Third Party Activity&rdquo;), we are not responsible for any loss as a result of such Third Party
        Activity. If your use of Services, including any transaction or transmission, as a result of your actions or
        those of a third party, mistakenly or fraudulently signed for using your private key, we are not liable.
      </li>
      <li>
        We shall not be held liable for any damages incurred by you when it is unable to provide the Services for any
        one of the following reasons: <br />
        <ol style={{ listStyleType: 'lower-alpha' }}>
          <li>A force majeure event or a state equivalent thereto beyond the control of the Klaytn.</li>
          <li>Damages caused by false or inaccurate information provided by you.</li>
          <li>Disruption to Service use or damages incurred due to causes attributable to you or users.</li>
          <li>
            Damages incurred by an infringement of a third party&apos;s intellectual property rights caused by your
            actions.
          </li>
          <li>Other reasons where there is no willful misconduct or gross negligence on the part of the Klaytn.</li>
        </ol>
      </li>
      <li>
        We shall not be liable whatsoever for any disadvantages, damages or losses incurred by you due to any
        transaction between users or between users and a third party where the Services were used as a medium, unless
        caused by our gross negligence or willful misconduct.
      </li>
    </ol>
    <h3>9. Privacy Policy</h3>
    <ol start={1}>
      <li>
        We do not collect or use your personal information in the course of providing the Services and KSafe does not
        require your personal information for your access to the Services. You will only need to connect your blockchain
        wallet without providing any personal information.
      </li>
      <li>
        Notwithstanding the foregoing, we care about data privacy and security. Please review Klaytn&apos;s privacy
        policy on{' '}
        <Link href="https://klaytn.foundation/privacy/">
          <MUILink target="_blank" rel="noreferrer">
            https://klaytn.foundation/privacy/
          </MUILink>
        </Link>
        . By using KSafe, you are agreeing to be bound by Klaytn privacy policy, which is incorporated into the Terms of
        Use.
      </li>
    </ol>
    <h3>10. Term and Termination</h3>
    <ol start={1}>
      <li>
        The Terms of Use Shall remain in full force and effect while you are using the KSafe. Without limiting any other
        provision of the Terms of Use, we reserve the right to, in our sole discretion and without notice or liability,
        deny access to and use of the KSafe, to any person for any reason or for no reason, including without limitation
        for breach of any representation, warranty contained in this Agreement or any terms in the Terms of Use of any
        applicable law or regulation.
      </li>
      <li>
        You may terminate this Agreement at any given time by not using this Services or by requesting termination to
        the contact information provided herein. All benefits acquired through the use of the Services shall expire upon
        termination of this Agreement. You shall be solely responsible for moving or securing any assets within your
        KSafe before your termination and we shall neither be held liable for or obligated to compensate for such loss.
      </li>
      <li>
        We may terminate your use or participation of KSafe or delete any content or information that you posted at any
        time, in our sole discretion, for any of the following reasons:
        <ol style={{ listStyleType: 'lower-alpha' }}>
          <li>
            When you cause interruption upon the operation of the Services by your willful misconduct or negligence.
          </li>
          <li>When there is a breach of this Agreement or any part of the Terms of Use.</li>
          <li>
            When such restriction or suspension is inevitable due to inspection and maintenance of Service-related
            facilities or construction.
          </li>
          <li>
            When normal Service provision is impossible due to facility maintenance or inspection, etc., of
            facilities-based telecommunications business entities.
          </li>
          <li>
            When there is a disruption in Service use due to national emergencies, power outage, equipment failure or
            excessive traffic.
          </li>
          <li>
            When the we recognize that it is inappropriate to continue the provision of the Services for other reasons.
          </li>
        </ol>
      </li>
    </ol>
    <h3>11. Dispute Resolution</h3>
    <p>
      This Agreement shall be prescribed and implemented in accordance with the laws of the Republic of Singapore
      excluding any principles of conflict of lawsand courts of Singapore shall have exclusive jurisdiction over any
      disputes between you and Klaytn with regard to the use of the Services. If there is any conflict between Klaytn
      website terms of use and this Agreement, this Agreement shall prevail.
    </p>
    <h3>12. Contact Us</h3>
    <p>
      Klaytn Foundation Limited. <br />
      <Link href="mailto:contact@klaytn.foundation">
        <MUILink target="_blank" rel="noreferrer">
          contact@klaytn.foundation
        </MUILink>
      </Link>
    </p>
  </div>
)

const Terms: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'KlaytnSafe{Wallet} – Terms'}</title>
      </Head>

      <main>{IS_OFFICIAL_HOST && <SafeTerms />}</main>
    </>
  )
}

export default Terms
