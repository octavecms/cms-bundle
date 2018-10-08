<?php

namespace Octave\CMSBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Knp\DoctrineBehaviors\Model as ORMBehaviors;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 *
 * @ORM\Entity()
 * @ORM\Table(name="octave_page_block_translations")
 */
class BlockTranslation
{
    use ORMBehaviors\Translatable\Translation;
    use BlockTranslationTrait;
}