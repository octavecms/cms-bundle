<?php

namespace Octave\CMSBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Knp\DoctrineBehaviors\Model as ORMBehaviors;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 *
 * @ORM\Entity()
 * @ORM\Table(
 *     name="octave_page_blocks"
 * )
 */
class Block
{
    use ORMBehaviors\Translatable\Translatable;
    use TranslatableEntityTrait;
    use BlockTrait;

    /**
     * @var Page
     * @ORM\ManyToOne(targetEntity="Page", inversedBy="blocks", cascade={"persist"})
     * @ORM\JoinColumn(name="page_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $page;


    /**
     * @return Page
     */
    public function getPage()
    {
        return $this->page;
    }

    /**
     * @param Page $page
     */
    public function setPage($page)
    {
        $this->page = $page;
    }
}