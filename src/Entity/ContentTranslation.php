<?php

namespace VideInfra\CMSBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Knp\DoctrineBehaviors\Model as ORMBehaviors;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 *
 * @ORM\Entity()
 * @ORM\Table(name="vig_page_content_translations")
 */
class ContentTranslation
{
    use ORMBehaviors\Translatable\Translation;

    /**
     * @var string
     * @ORM\Column(type="text", nullable=true)
     */
    private $text;

    /**
     * @return string
     */
    public function getText()
    {
        return $this->text;
    }

    /**
     * @param string $text
     */
    public function setText($text)
    {
        $this->text = $text;
    }
}