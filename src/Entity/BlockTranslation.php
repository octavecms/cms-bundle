<?php

namespace VideInfra\CMSBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Knp\DoctrineBehaviors\Model as ORMBehaviors;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 *
 * @ORM\Entity()
 * @ORM\Table(name="vig_page_block_translations")
 */
class BlockTranslation
{
    use ORMBehaviors\Translatable\Translation;

    /**
     * @var string
     * @ORM\Column(type="text")
     */
    private $content;

    /**
     * @return string
     */
    public function getContent()
    {
        return $this->content;
    }

    /**
     * @param string $content
     */
    public function setContent($content)
    {
        $this->content = $content;
    }
}