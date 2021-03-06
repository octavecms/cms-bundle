<?php

namespace Octave\CMSBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Octave\CMSBundle\Entity\Content;
use Octave\CMSBundle\Entity\Page;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class ContentRepository extends EntityRepository
{
    /**
     * @param null $page
     * @return Content
     */
    public function create($page = null)
    {
        $content = new Content();
        $content->setPage($page);
        $this->getEntityManager()->persist($content);

        return $content;
    }

    /**
     * @param Page $page
     * @return null|object
     */
    public function findByPageOrCreate(Page $page)
    {
        if (!$page->getId()) {
            return $this->create($page);
        }

        $content = $this->findOneBy(['page' => $page]);

        if (!$content) {
            $content = $this->create();
            $content->setPage($page);
        }

        return $content;
    }
}